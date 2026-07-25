require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const httpLogger = require("./src/middleware/httpLogger");
const { errorHandler, notFound } = require("./src/middleware/errorHandler");

// Refuse to boot if the template's placeholder secrets were never replaced.
// Prevents an app from silently running with a publicly known JWT_SECRET.
const PLACEHOLDER_VALUES = {
  JWT_SECRET: "your_jwt_secret_here",
  LOG_HMAC_KEY: "your_log_hmac_key_here",
};

for (const [key, placeholder] of Object.entries(PLACEHOLDER_VALUES)) {
  if (process.env[key] === placeholder) {
    console.error(
      `FATAL: ${key} is still set to its placeholder value. Generate a real secret (e.g. "openssl rand -hex 32") and update your .env file.`
    );
    process.exit(1);
  }
}

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes will be mounted here as we build them
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/notes", require("./src/routes/noteRoutes"));

// 404 + error handling — must be last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start accepting requests once MongoDB is actually connected
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
