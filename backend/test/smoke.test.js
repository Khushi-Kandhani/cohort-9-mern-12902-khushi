const request = require("supertest");
const { expect } = require("chai");

const app = require("../server");

describe("Smoke test", () => {
  it("GET /health should return 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("status", "ok");
  });
});
