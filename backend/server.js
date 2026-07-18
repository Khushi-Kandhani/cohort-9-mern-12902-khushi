require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const httpLogger = require("./src/middleware/httpLogger");
const { errorHandler, notFound } = require("./src/middleware/errorHandler");

const app = express();

// Connect to MongoDB
connectDB();

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
// app.use("/api/notes", require("./src/routes/noteRoutes"));

// 404 + error handling — must be last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
