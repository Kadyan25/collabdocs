import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessDocument } from "@/lib/access";
import { errorResponse } from "@/lib/api-response";

const ACTIVE_WINDOW_MS = 10_000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Not signed in", 401);

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { shares: true },
  });
  if (!document) return errorResponse("Document not found", 404);
  if (!canAccessDocument(document, document.shares, user.id)) {
    return errorResponse("You don't have access to this document", 403);
  }

  const others = await prisma.documentPresence.findMany({
    where: {
      documentId: id,
      userId: { not: user.id },
      lastSeenAt: { gte: new Date(Date.now() - ACTIVE_WINDOW_MS) },
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ viewers: others.map((p) => p.user.name) });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Not signed in", 401);

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { shares: true },
  });
  if (!document) return errorResponse("Document not found", 404);
  if (!canAccessDocument(document, document.shares, user.id)) {
    return errorResponse("You don't have access to this document", 403);
  }

  await prisma.documentPresence.upsert({
    where: { documentId_userId: { documentId: id, userId: user.id } },
    update: { lastSeenAt: new Date() },
    create: { documentId: id, userId: user.id },
  });

  return NextResponse.json({ ok: true });
}
