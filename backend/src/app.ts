import express from "express";
import cors from "cors";
import helmet from "helmet";
import httpLogger from "./middleware/httpLogger";
import { errorHandler, notFound } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import noteRoutes from "./routes/noteRoutes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(httpLogger);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
