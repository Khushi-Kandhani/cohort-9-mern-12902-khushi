const request = require("supertest");
const { expect } = require("chai");

const app = require("../server");
const User = require("../src/models/User");
const Note = require("../src/models/Note");

describe("Notes API", () => {
  let tokenA, tokenB, userAId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});

    // Create User A and log them in
    await request(app)
      .post("/api/auth/signup")
      .send({ name: "User A", email: "usera@example.com", password: "password123" });

    const loginA = await request(app)
      .post("/api/auth/login")
      .send({ email: "usera@example.com", password: "password123" });

    tokenA = loginA.body.data.token;
    userAId = loginA.body.data.user.id;

    // Create User B and log them in
    await request(app)
      .post("/api/auth/signup")
      .send({ name: "User B", email: "userb@example.com", password: "password123" });

    const loginB = await request(app)
      .post("/api/auth/login")
      .send({ email: "userb@example.com", password: "password123" });

    tokenB = loginB.body.data.token;
  });

  describe("POST /api/notes", () => {
    it("should create a note for the logged-in user", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "My Note", content: "Some content" });

      expect(res.status).to.equal(201);
      expect(res.body.data).to.have.property("title", "My Note");
      expect(res.body.data.user).to.equal(userAId);
    });

    it("should reject creating a note without a token", async () => {
      const res = await request(app)
        .post("/api/notes")
        .send({ title: "My Note", content: "Some content" });

      expect(res.status).to.equal(401);
    });

    it("should reject a note with no title", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ content: "Some content" });

      expect(res.status).to.equal(400);
    });
  });

  describe("GET /api/notes", () => {
    it("should list only the logged-in user's notes", async () => {
      await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "A's Note", content: "content" });

      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);
      expect(res.body.count).to.equal(1);
    });

    it("should return an empty list for a user with no notes", async () => {
      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).to.equal(200);
      expect(res.body.count).to.equal(0);
    });
  });

  describe("Ownership enforcement", () => {
    it("should return 404 when User B tries to access User A's note", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "Private", content: "Only A should see this" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).to.equal(404);
    });

    it("should return 404 when User B tries to update User A's note", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "Private", content: "Only A should edit this" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ title: "Hacked!" });

      expect(res.status).to.equal(404);
    });

    it("should return 404 when User B tries to delete User A's note", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "Private", content: "Only A should delete this" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).to.equal(404);
    });
  });

  describe("PUT/DELETE /api/notes/:id", () => {
    it("should update a note the user owns", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "Original", content: "content" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "Updated", content: "new content" });

      expect(res.status).to.equal(200);
      expect(res.body.data.title).to.equal("Updated");
    });

    it("should delete a note the user owns", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "To delete", content: "content" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);

      const getRes = await request(app)
        .get(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(getRes.status).to.equal(404);
    });

    it("should return 404 for a nonexistent note ID", async () => {
      const res = await request(app)
        .get("/api/notes/000000000000000000000000")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).to.equal(404);
    });
  });
});
