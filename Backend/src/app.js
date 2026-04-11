import express from "express";
import cors from "cors";
import "./config/db.js"; // establish MongoDB connection
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import jdRoutes from "./routes/jd.routes.js";
import stripeRoutes from "./routes/stripe.routes.js";

const app = express();

// CORS — allow frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"))

// ⚠️ Stripe webhook MUST be mounted before express.json()
// (raw body required for signature verification)
app.use("/api/stripe", stripeRoutes);

// JSON body parser for all other routes
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);

// Health check
app.get("/", (req, res) => res.json({ status: "ok" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

export default app;