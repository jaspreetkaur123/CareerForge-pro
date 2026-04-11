import Stripe from "stripe";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
// Lazy init so placeholder keys in .env don't crash the server
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);
// POST /api/stripe/create-checkout-session
export const createCheckoutSession = async (req, res) => {
  try {
    const user = req.user;
    if (user.plan === "pro") {
      return res.status(400).json({ message: "Already on Pro plan" });
    }
    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?upgrade=canceled`,
      metadata: { userId: user._id.toString() },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// POST /api/stripe/webhook  — raw body required (no JSON parsing)
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const subscription = await getStripe().subscriptions.retrieve(session.subscription);
        await User.findByIdAndUpdate(userId, { plan: "pro" });
        await Subscription.findOneAndUpdate(
          { userId },
          {
            userId,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            plan: "pro",
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          { upsert: true, new: true }
        );
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const dbSub = await Subscription.findOne({ stripeSubscriptionId: sub.id });
        if (dbSub) {
          await User.findByIdAndUpdate(dbSub.userId, { plan: "free" });
          await Subscription.findByIdAndUpdate(dbSub._id, { status: "canceled", plan: "free" });
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeCustomerId: inv.customer },
          { status: "past_due" }
        );
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          {
            status: sub.status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          }
        );
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET /api/stripe/subscription  — get current user's subscription info
export const getSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) return res.json({ plan: "free", subscription: null });
    res.json({ plan: req.user.plan, subscription: sub });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};