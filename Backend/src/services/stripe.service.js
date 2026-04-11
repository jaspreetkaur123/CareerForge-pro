import Stripe from "stripe";
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);
/**
 * Create or retrieve a Stripe customer for a user.
 * @param {object} user - Mongoose User document
 * @returns {Promise<string>} Stripe customer ID
 */
export const getOrCreateCustomer = async (user) => {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() },
  });
  return customer.id;
};
/**
 * Retrieve a Stripe subscription.
 * @param {string} subscriptionId
 */
export const getSubscription = async (subscriptionId) => {
  return getStripe().subscriptions.retrieve(subscriptionId);
};
export default { getOrCreateCustomer, getSubscription };
