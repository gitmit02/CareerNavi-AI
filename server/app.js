const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middlewares/error.middleware");

// Route imports
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const roadmapRoutes = require("./routes/roadmap.routes");
const skillGapRoutes = require("./routes/skillGap.routes");
const chatRoutes = require("./routes/chat.routes");
const progressRoutes = require("./routes/progress.routes");
const opportunityRoutes = require("./routes/opportunity.routes");
const aiRoutes = require("./routes/ai.routes");
const { authLimiter, aiLimiter, apiLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();

// --- Global middlewares ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Health check ---
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 CareerNavi AI Backend is running",
  });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, status: "OK", timestamp: new Date().toISOString() });
});

// --- API routes ---
app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
// LLM-backed routes: throttle to protect Groq quota / cost
app.use("/api/chat", aiLimiter);
app.post("/api/roadmap/generate", aiLimiter);
app.use("/api/skill-gap", aiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/ai", aiRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
