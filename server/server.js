require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server.
// If DB connection fails, connectDB() itself exits the process.
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 CareerNavi AI backend running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  });

  // Handle unhandled promise rejections gracefully
  process.on("unhandledRejection", (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
