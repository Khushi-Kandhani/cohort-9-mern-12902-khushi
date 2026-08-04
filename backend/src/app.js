const express = require("express");
const cors = require("cors");
const httpLogger = require("./middleware/httpLogger");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));

// 404 + error handling — must be last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
