const { expect } = require("chai");
const request = require("supertest");
const app = require("../src/app");

require("./setup");

describe("Notes Controller", () => {
  const userA = { name: "User A", email: "usera@example.com", password: "test1234" };
  const userB = { name: "User B", email: "userb@example.com", password: "test1234" };

  async function registerAndLogin(user) {
    await request(app).post("/api/auth/signup").send(user);
    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: user.password,
    });
    return res.body.data.token;
  }

  describe("POST /api/notes", () => {
    it("creates a note for the authenticated user", async () => {
      const token = await registerAndLogin(userA);

      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "My first note", content: "<p>Some content</p>" });

      expect(res.status).to.equal(201);
      expect(res.body.data.title).to.equal("My first note");
    });

    it("rejects a note with empty content", async () => {
      const token = await registerAndLogin(userA);

      const res = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Empty note", content: "<p></p>" });

      expect(res.status).to.equal(400);
    });

    it("rejects creating a note without a token", async () => {
      const res = await request(app)
        .post("/api/notes")
        .send({ title: "No auth", content: "should fail" });

      expect(res.status).to.equal(401);
    });
  });

  describe("GET /api/notes", () => {
    it("returns only the logged-in user's notes", async () => {
      const tokenA = await registerAndLogin(userA);
      const tokenB = await registerAndLogin(userB);

      await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "A's note", content: "belongs to A" });

      await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ title: "B's note", content: "belongs to B" });

      const res = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);
      expect(res.body.count).to.equal(1);
      expect(res.body.data[0].title).to.equal("A's note");
    });
  });

  describe("GET /api/notes/:id", () => {
    it("blocks user B from reading user A's note by id", async () => {
      const tokenA = await registerAndLogin(userA);
      const tokenB = await registerAndLogin(userB);

      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "Private note", content: "only A should see this" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).to.equal(404);
    });
  });

  describe("PUT /api/notes/:id", () => {
    it("blocks user B from updating user A's note", async () => {
      const tokenA = await registerAndLogin(userA);
      const tokenB = await registerAndLogin(userB);

      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "Original title", content: "original content" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ title: "Hacked title" });

      expect(res.status).to.equal(404);
    });

    it("allows the owner to update their own note", async () => {
      const token = await registerAndLogin(userA);

      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Before", content: "before content" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "After" });

      expect(res.status).to.equal(200);
      expect(res.body.data.title).to.equal("After");
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("blocks user B from deleting user A's note", async () => {
      const tokenA = await registerAndLogin(userA);
      const tokenB = await registerAndLogin(userB);

      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "Should survive", content: "content" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).to.equal(404);
    });

    it("allows the owner to delete their own note", async () => {
      const token = await registerAndLogin(userA);

      const createRes = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "To delete", content: "content" });

      const noteId = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
    });
  });
});
