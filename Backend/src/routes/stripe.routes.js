import { Router } from "express";
import express from "express";
import auth from "../middleware/auth.js";
import {
  createCheckoutSession,
  handleWebhook,
  getSubscription,
} from "../controllers/stripe.controller.js";
const router = Router();
// Webhook must use raw body — registered before express.json() in app.js
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);
// Protected routes
router.post("/create-checkout-session", auth, createCheckoutSession);
router.get("/subscription", auth, getSubscription);
export default router;
