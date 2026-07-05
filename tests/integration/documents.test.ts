import { describe, expect, it, beforeAll } from "vitest";
import { authedFetch, loginAs } from "./helpers";

describe("document CRUD and access control", () => {
  let alice: { cookie: string; userId: string };
  let bob: { cookie: string; userId: string };
  let carol: { cookie: string; userId: string };
  let docId: string;

  beforeAll(async () => {
    alice = await loginAs("alice@example.com");
    bob = await loginAs("bob@example.com");
    carol = await loginAs("carol@example.com");
  });

  it("lets an authenticated user create a document", async () => {
    const res = await authedFetch(alice.cookie)("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Integration Test Doc" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.document.title).toBe("Integration Test Doc");
    expect(data.document.ownerId).toBe(alice.userId);
    docId = data.document.id;
  });

  it("lists the new document under the owner's documents", async () => {
    const res = await authedFetch(alice.cookie)("/api/documents");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.owned.some((d: { id: string }) => d.id === docId)).toBe(true);
  });

  it("lets the owner update the document's title and content", async () => {
    const res = await authedFetch(alice.cookie)(`/api/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Renamed", content: "<p>hello</p>" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.document.title).toBe("Renamed");
    expect(data.document.content).toBe("<p>hello</p>");
  });

  it("denies an unrelated user from reading a private document", async () => {
    const res = await authedFetch(bob.cookie)(`/api/documents/${docId}`);
    expect(res.status).toBe(403);
  });

  it("denies an unrelated user from editing a private document", async () => {
    const res = await authedFetch(bob.cookie)(`/api/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Hijacked" }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 for a document that doesn't exist", async () => {
    const res = await authedFetch(alice.cookie)("/api/documents/does-not-exist");
    expect(res.status).toBe(404);
  });

  describe("sharing and role enforcement", () => {
    it("lets the owner share the document with EDITOR access", async () => {
      const res = await authedFetch(alice.cookie)(`/api/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "bob@example.com", role: "EDITOR" }),
      });
      expect(res.status).toBe(201);
    });

    it("lets a shared EDITOR read and update the document", async () => {
      const getRes = await authedFetch(bob.cookie)(`/api/documents/${docId}`);
      expect(getRes.status).toBe(200);

      const patchRes = await authedFetch(bob.cookie)(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Edited by Bob" }),
      });
      expect(patchRes.status).toBe(200);
    });

    it("rejects sharing the same document with the same user twice", async () => {
      const res = await authedFetch(alice.cookie)(`/api/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "bob@example.com", role: "EDITOR" }),
      });
      expect(res.status).toBe(409);
    });

    it("rejects sharing a document with its own owner", async () => {
      const res = await authedFetch(alice.cookie)(`/api/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "alice@example.com", role: "EDITOR" }),
      });
      expect(res.status).toBe(409);
    });

    it("rejects sharing with an email that isn't a seeded user", async () => {
      const res = await authedFetch(alice.cookie)(`/api/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nobody@example.com", role: "EDITOR" }),
      });
      expect(res.status).toBe(404);
    });

    it("lets a VIEWER read but not edit the document", async () => {
      const shareRes = await authedFetch(alice.cookie)(`/api/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "carol@example.com", role: "VIEWER" }),
      });
      expect(shareRes.status).toBe(201);

      const getRes = await authedFetch(carol.cookie)(`/api/documents/${docId}`);
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.canEdit).toBe(false);

      const patchRes = await authedFetch(carol.cookie)(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Carol shouldn't be able to do this" }),
      });
      expect(patchRes.status).toBe(403);
    });

    it("only lets the owner view sharing settings", async () => {
      const res = await authedFetch(bob.cookie)(`/api/documents/${docId}/share`);
      expect(res.status).toBe(403);
    });
  });
});
