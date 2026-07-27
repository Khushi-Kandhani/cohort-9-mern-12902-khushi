import "dotenv/config";
import app from "./src/app";
import connectDB from "./src/config/db";
import validateEnv from "./src/config/validateEnv";

validateEnv();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
