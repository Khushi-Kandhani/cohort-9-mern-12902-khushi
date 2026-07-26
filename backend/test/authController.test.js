const { expect } = require("chai");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

require("./setup");

describe("Auth Controller", () => {
  const testUser = {
    name: "Test User",
    email: "testuser@example.com",
    password: "test1234",
  };

  describe("POST /api/auth/signup", () => {
    it("creates a new user and returns 201", async () => {
      const res = await request(app).post("/api/auth/signup").send(testUser);

      expect(res.status).to.equal(201);
      expect(res.body.success).to.equal(true);
      expect(res.body.data).to.include({ name: testUser.name, email: testUser.email });
      expect(res.body.data.password).to.be.undefined;
    });

    it("rejects a duplicate email with 409", async () => {
      await request(app).post("/api/auth/signup").send(testUser);
      const res = await request(app).post("/api/auth/signup").send(testUser);

      expect(res.status).to.equal(409);
      expect(res.body.success).to.equal(false);
    });

    it("rejects signup with missing required fields", async () => {
      const res = await request(app).post("/api/auth/signup").send({ email: "no-name@example.com" });

      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/signup").send(testUser);
    });

    it("logs in with correct credentials and returns a token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.data.token).to.be.a("string");
      expect(res.body.data.user.email).to.equal(testUser.email);
    });

    it("rejects login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.status).to.equal(401);
      expect(res.body.success).to.equal(false);
    });

    it("rejects login with an email that doesn't exist", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nobody@example.com",
        password: "whatever123",
      });

      expect(res.status).to.equal(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("revokes the token so it can't be reused on protected routes", async () => {
      await request(app).post("/api/auth/signup").send(testUser);
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      const token = loginRes.body.data.token;

      // token works before logout
      const beforeLogout = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${token}`);
      expect(beforeLogout.status).to.equal(200);

      // logout revokes it
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);
      expect(logoutRes.status).to.equal(200);

      // same token should now be rejected
      const afterLogout = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${token}`);
      expect(afterLogout.status).to.equal(401);
    });

    it("rejects logout without a token", async () => {
      const res = await request(app).post("/api/auth/logout");
      expect(res.status).to.equal(401);
    });
  });
});
