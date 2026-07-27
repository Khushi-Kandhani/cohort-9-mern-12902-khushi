import "dotenv/config";
import app from "./src/app";
import connectDB from "./src/config/db";

// Refuse to boot if required secrets are missing or still set to the
// template's placeholder values. Fail fast at startup instead of only
// crashing the first time someone hits an auth-related route.
const REQUIRED_SECRETS: Record<string, string> = {
  JWT_SECRET: "your_jwt_secret_here",
  LOG_HMAC_KEY: "your_log_hmac_key_here",
};

for (const [key, placeholder] of Object.entries(REQUIRED_SECRETS)) {
  const value = process.env[key];
  if (!value) {
    console.error(`FATAL: ${key} is not set. Add it to your .env file before starting the server.`);
    process.exit(1);
  }
  if (value === placeholder) {
    console.error(
      `FATAL: ${key} is still set to its placeholder value. Generate a real secret (e.g. "openssl rand -hex 32") and update your .env file.`
    );
    process.exit(1);
  }
}

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
