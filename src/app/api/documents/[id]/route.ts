import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessDocument, canEditDocument, isOwner } from "@/lib/access";
import { updateDocumentSchema } from "@/lib/validation";
import { errorResponse } from "@/lib/api-response";
import { sanitizeDocumentHtml } from "@/lib/sanitize";
import { snapshotDocumentVersion } from "@/lib/versions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Not signed in", 401);

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { shares: true, owner: { select: { name: true, email: true } } },
  });

  if (!document) return errorResponse("Document not found", 404);
  if (!canAccessDocument(document, document.shares, user.id)) {
    return errorResponse("You don't have access to this document", 403);
  }

  return NextResponse.json({
    document,
    isOwner: isOwner(document, user.id),
    canEdit: canEditDocument(document, document.shares, user.id),
  });
}

export async function PATCH(
  request: NextRequest,
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
  if (!canEditDocument(document, document.shares, user.id)) {
    return errorResponse("You don't have edit access to this document", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid update", 400);
  }

  await snapshotDocumentVersion(document, user.id);

  const updated = await prisma.document.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.content !== undefined
        ? { content: sanitizeDocumentHtml(parsed.data.content) }
        : {}),
    },
  });

  return NextResponse.json({ document: updated });
}
