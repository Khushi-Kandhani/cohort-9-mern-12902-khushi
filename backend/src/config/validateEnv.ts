import logger from "../middleware/logger";

// Refuse to boot if required secrets are missing, whitespace-only, or still
// set to the template's placeholder values. Fail fast at startup instead of
// only crashing the first time someone hits an auth-related route.
const PLACEHOLDER_VALUES: Record<string, string> = {
  JWT_SECRET: "your_jwt_secret_here",
  LOG_HMAC_KEY: "your_log_hmac_key_here",
};

const validateEnv = (): void => {
  const required = ["JWT_SECRET", "LOG_HMAC_KEY", "MONGO_URI"] as const;
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    logger.error({ missing }, "Missing required environment variables");
    process.exit(1);
  }

  const placeholders = required.filter(
    (key) =>
      PLACEHOLDER_VALUES[key] &&
      process.env[key]?.trim() === PLACEHOLDER_VALUES[key]
  );

  if (placeholders.length > 0) {
    logger.error(
      { placeholders },
      'One or more required environment variables are still set to their placeholder values. Generate real secrets (e.g. "openssl rand -hex 32") and update your .env file.'
    );
    process.exit(1);
  }
};

export default validateEnv;
