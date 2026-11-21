require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const createCorsOrigin = require("./config/corsOrigin");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobsRoutes = require("./routes/savedJobsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
app.set("trust proxy", 1);

// Middleware to handle CORS
app.use(
  cors({
    origin: createCorsOrigin(),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Root route — prevents "Cannot GET /" when accessing backend directly
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "NxtServe Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      user: "/api/user",
      jobs: "/api/jobs",
      applications: "/api/applications",
      savedJobs: "/api/save-jobs",
      analytics: "/api/analytics",
      ai: "/api/ai",
      health: "/api/health",
    },
  });
});

// Favicon — return 204 (no content) so browser uses default
app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many AI requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Connect Database
connectDB();

// Middleware
app.use(express.json());

// Apply rate limiting to auth routes
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/login", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/save-jobs", savedJobsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
