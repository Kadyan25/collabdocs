import { describe, expect, it } from "vitest";
import { BASE_URL, getSeededUser } from "./helpers";

describe("auth", () => {
  it("logs in a valid seeded user and sets a session cookie", async () => {
    const alice = await getSeededUser("alice@example.com");
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: alice.id }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("currentUserId=");
  });

  it("rejects login with a userId that doesn't exist", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "not-a-real-user-id" }),
    });
    expect(res.status).toBe(404);
  });

  it("rejects login with a missing userId", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("rejects unauthenticated requests to protected API routes", async () => {
    const res = await fetch(`${BASE_URL}/api/documents`);
    expect(res.status).toBe(401);
  });
});
