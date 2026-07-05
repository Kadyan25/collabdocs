import { describe, expect, it, beforeAll } from "vitest";
import { authedFetch, loginAs } from "./helpers";

describe("file import", () => {
  let alice: { cookie: string; userId: string };

  beforeAll(async () => {
    alice = await loginAs("alice@example.com");
  });

  it("imports a .md file and converts it into a formatted document", async () => {
    const formData = new FormData();
    const blob = new Blob(["# Heading\n\n**bold** text"], { type: "text/markdown" });
    formData.append("file", blob, "notes.md");

    const res = await authedFetch(alice.cookie)("/api/documents/import", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.document.title).toBe("notes");
    expect(data.document.content).toContain("<h1>Heading</h1>");
    expect(data.document.content).toContain("<strong>bold</strong>");
  });

  it("imports a .txt file and wraps it into paragraphs", async () => {
    const formData = new FormData();
    const blob = new Blob(["Plain text content."], { type: "text/plain" });
    formData.append("file", blob, "plain.txt");

    const res = await authedFetch(alice.cookie)("/api/documents/import", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.document.content).toBe("<p>Plain text content.</p>");
  });

  it("strips a <script> tag embedded in an imported .md file", async () => {
    const formData = new FormData();
    const blob = new Blob(["# Title\n\n<script>alert('xss')</script>"], {
      type: "text/markdown",
    });
    formData.append("file", blob, "malicious.md");

    const res = await authedFetch(alice.cookie)("/api/documents/import", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.document.content).not.toContain("<script>");
  });

  it("rejects a disallowed file extension", async () => {
    const formData = new FormData();
    const blob = new Blob(["fake pdf content"], { type: "application/pdf" });
    formData.append("file", blob, "document.pdf");

    const res = await authedFetch(alice.cookie)("/api/documents/import", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(400);
  });

  it("rejects a request with no file", async () => {
    const formData = new FormData();
    const res = await authedFetch(alice.cookie)("/api/documents/import", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(400);
  });

  it("rejects unauthenticated import requests", async () => {
    const formData = new FormData();
    const blob = new Blob(["hi"], { type: "text/plain" });
    formData.append("file", blob, "notes.txt");

    const res = await fetch(`${process.env.TEST_BASE_URL ?? "http://localhost:3001"}/api/documents/import`, {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(401);
  });
});
