export type AccessCheckDocument = { ownerId: string };
export type AccessCheckShare = { userId: string; role: "VIEWER" | "EDITOR" };

export function canAccessDocument(
  document: AccessCheckDocument,
  shares: AccessCheckShare[],
  userId: string
): boolean {
  if (document.ownerId === userId) return true;
  return shares.some((share) => share.userId === userId);
}

export function canEditDocument(
  document: AccessCheckDocument,
  shares: AccessCheckShare[],
  userId: string
): boolean {
  if (document.ownerId === userId) return true;
  const share = shares.find((s) => s.userId === userId);
  return share?.role === "EDITOR";
}

export function isOwner(document: AccessCheckDocument, userId: string): boolean {
  return document.ownerId === userId;
}
