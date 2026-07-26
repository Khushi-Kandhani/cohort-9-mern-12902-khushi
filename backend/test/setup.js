require("dotenv").config();
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Fall back to test-safe values if .env doesn't have them (e.g. in CI)
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-for-mocha-only";
process.env.LOG_HMAC_KEY = process.env.LOG_HMAC_KEY || "test-hmac-key-for-mocha-only";

let mongod;

before(async function () {
  this.timeout(120000);
  mongod = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 60000,
    },
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterEach(async function () {
  this.timeout(10000);
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

after(async function () {
  this.timeout(20000);
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});
