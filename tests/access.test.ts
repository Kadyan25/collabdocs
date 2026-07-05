import { describe, expect, it } from "vitest";
import { canAccessDocument, canEditDocument, isOwner } from "../src/lib/access";

const document = { ownerId: "owner-1" };

describe("canAccessDocument", () => {
  it("grants access to the owner", () => {
    expect(canAccessDocument(document, [], "owner-1")).toBe(true);
  });

  it("grants access to a user with a share, regardless of role", () => {
    const shares = [{ userId: "shared-user", role: "VIEWER" as const }];
    expect(canAccessDocument(document, shares, "shared-user")).toBe(true);
  });

  it("denies access to an unrelated user", () => {
    const shares = [{ userId: "shared-user", role: "EDITOR" as const }];
    expect(canAccessDocument(document, shares, "random-user")).toBe(false);
  });

  it("denies access when there are no shares and the user isn't the owner", () => {
    expect(canAccessDocument(document, [], "random-user")).toBe(false);
  });
});

describe("canEditDocument", () => {
  it("allows the owner to edit", () => {
    expect(canEditDocument(document, [], "owner-1")).toBe(true);
  });

  it("allows a shared user with EDITOR role to edit", () => {
    const shares = [{ userId: "shared-user", role: "EDITOR" as const }];
    expect(canEditDocument(document, shares, "shared-user")).toBe(true);
  });

  it("denies a shared user with VIEWER role from editing", () => {
    const shares = [{ userId: "shared-user", role: "VIEWER" as const }];
    expect(canEditDocument(document, shares, "shared-user")).toBe(false);
  });

  it("denies an unrelated user from editing", () => {
    const shares = [{ userId: "shared-user", role: "EDITOR" as const }];
    expect(canEditDocument(document, shares, "random-user")).toBe(false);
  });
});

describe("isOwner", () => {
  it("returns true for the owner", () => {
    expect(isOwner(document, "owner-1")).toBe(true);
  });

  it("returns false for a non-owner", () => {
    expect(isOwner(document, "someone-else")).toBe(false);
  });
});
