import "dotenv/config";
import { createServer } from "http";
import validateEnv from "./src/config/validateEnv";
import connectDB from "./src/config/db";
import app from "./src/app";
import { initSocket } from "./src/socket";

validateEnv();

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
initSocket(httpServer);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
