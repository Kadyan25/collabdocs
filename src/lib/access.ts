export type AccessCheckDocument = { ownerId: string };
export type AccessCheckShare = { userId: string };

export function canAccessDocument(
  document: AccessCheckDocument,
  shares: AccessCheckShare[],
  userId: string
): boolean {
  if (document.ownerId === userId) return true;
  return shares.some((share) => share.userId === userId);
}

export function isOwner(document: AccessCheckDocument, userId: string): boolean {
  return document.ownerId === userId;
}
