import "dotenv/config";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-for-mocha-only";
process.env.LOG_HMAC_KEY = process.env.LOG_HMAC_KEY || "test-hmac-key-for-mocha-only";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://placeholder:27017/test";

let mongod: MongoMemoryServer | undefined;

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
    // If connect() fails after create() succeeds, make sure the mongod
    // process doesn't leak - stop it before rethrowing.
    if (mongod) {
      await mongod.stop();
    }
    throw err;
  }
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
  try {
    await mongoose.disconnect();
  } finally {
    if (mongod) {
      await mongod.stop();
    }
  }
});
