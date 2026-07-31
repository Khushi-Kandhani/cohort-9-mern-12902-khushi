require("dotenv").config();
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Fall back to test-safe values if .env doesn't have them (e.g. in CI)
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-for-mocha-only";
process.env.LOG_HMAC_KEY = process.env.LOG_HMAC_KEY || "test-hmac-key-for-mocha-only";

let mongod;

before(async function () {
  this.timeout(120000);
  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 60000,
      },
    });
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  } catch (err) {
    // If MongoMemoryServer started but mongoose.connect failed, don't leak
    // the in-memory server process — stop it before failing the suite.
    if (mongod) {
      await mongod.stop().catch(() => {});
    }
    throw new Error(`Failed to set up in-memory MongoDB for tests: ${err.message}`);
  }
});

afterEach(async function () {
  this.timeout(10000);
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch (err) {
      throw new Error(`Failed to clear collection "${key}" between tests: ${err.message}`);
    }
  }
});

after(async function () {
  this.timeout(20000);
  const errors = [];

  try {
    await mongoose.disconnect();
  } catch (err) {
    errors.push(`mongoose.disconnect() failed: ${err.message}`);
  }

  if (mongod) {
    try {
      await mongod.stop();
    } catch (err) {
      errors.push(`mongod.stop() failed: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Test teardown encountered errors: ${errors.join("; ")}`);
  }
});
