import { describe, expect, it } from "vitest";
import {
  createDocumentSchema,
  updateDocumentSchema,
  shareDocumentSchema,
  loginSchema,
  createCommentSchema,
} from "../src/lib/validation";

describe("createDocumentSchema", () => {
  it("accepts a missing title (defaults happen elsewhere)", () => {
    expect(createDocumentSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a valid title", () => {
    expect(createDocumentSchema.safeParse({ title: "My Doc" }).success).toBe(true);
  });

  it("rejects an empty-string title", () => {
    expect(createDocumentSchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects a title over 200 characters", () => {
    expect(createDocumentSchema.safeParse({ title: "a".repeat(201) }).success).toBe(false);
  });
});

describe("updateDocumentSchema", () => {
  it("rejects an update with neither title nor content", () => {
    expect(updateDocumentSchema.safeParse({}).success).toBe(false);
  });

  it("accepts a title-only update", () => {
    expect(updateDocumentSchema.safeParse({ title: "New title" }).success).toBe(true);
  });

  it("accepts a content-only update", () => {
    expect(updateDocumentSchema.safeParse({ content: "<p>hi</p>" }).success).toBe(true);
  });

  it("rejects an empty-string title", () => {
    const result = updateDocumentSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });
});

describe("shareDocumentSchema", () => {
  it("accepts a valid email and defaults role to EDITOR when omitted", () => {
    const result = shareDocumentSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe("EDITOR");
  });

  it("lowercases and trims the email", () => {
    const result = shareDocumentSchema.safeParse({ email: "  User@Example.com  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("user@example.com");
  });

  it("rejects an invalid email", () => {
    expect(shareDocumentSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it("accepts an explicit VIEWER role", () => {
    const result = shareDocumentSchema.safeParse({ email: "user@example.com", role: "VIEWER" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe("VIEWER");
  });

  it("rejects an invalid role", () => {
    expect(
      shareDocumentSchema.safeParse({ email: "user@example.com", role: "ADMIN" }).success
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a non-empty userId", () => {
    expect(loginSchema.safeParse({ userId: "abc123" }).success).toBe(true);
  });

  it("rejects an empty userId", () => {
    expect(loginSchema.safeParse({ userId: "" }).success).toBe(false);
  });

  it("rejects a missing userId", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});

describe("createCommentSchema", () => {
  it("accepts a normal comment", () => {
    expect(createCommentSchema.safeParse({ body: "Nice work!" }).success).toBe(true);
  });

  it("rejects an empty comment", () => {
    expect(createCommentSchema.safeParse({ body: "" }).success).toBe(false);
  });

  it("rejects a whitespace-only comment after trimming", () => {
    expect(createCommentSchema.safeParse({ body: "   " }).success).toBe(false);
  });

  it("rejects a comment over 2000 characters", () => {
    expect(createCommentSchema.safeParse({ body: "a".repeat(2001) }).success).toBe(false);
  });
});
