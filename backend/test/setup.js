process.env.NODE_ENV = "test";

const mongoose = require("mongoose");

exports.mochaHooks = {
  afterAll(done) {
    mongoose.connection.close().then(() => done());
  },
};
