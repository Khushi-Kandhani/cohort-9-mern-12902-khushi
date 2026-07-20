const request = require("supertest");
const { expect } = require("chai");
const mongoose = require("mongoose");

const app = require("../server");
const User = require("../src/models/User");

describe("Auth API", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user with valid data", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test User", email: "test@example.com", password: "password123" });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property("email", "test@example.com");
      expect(res.body.data).to.not.have.property("password");
    });

    it("should reject signup with an invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test User", email: "not-an-email", password: "password123" });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it("should reject signup with a short password", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test User", email: "test@example.com", password: "123" });

      expect(res.status).to.equal(400);
    });

    it("should reject a duplicate email", async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test User", email: "test@example.com", password: "password123" });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Another User", email: "test@example.com", password: "password456" });

      expect(res.status).to.equal(409);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test User", email: "test@example.com", password: "password123" });
    });

    it("should log in with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.property("token");
      expect(res.body.data.token).to.be.a("string");
    });

    it("should reject an incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).to.equal(401);
    });

    it("should reject a nonexistent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "password123" });

      expect(res.status).to.equal(401);
    });
  });
});
