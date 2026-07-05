import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canEditDocument } from "@/lib/access";
import { errorResponse } from "@/lib/api-response";
import { snapshotDocumentVersion } from "@/lib/versions";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Not signed in", 401);

  const { id, versionId } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { shares: true },
  });
  if (!document) return errorResponse("Document not found", 404);
  if (!canEditDocument(document, document.shares, user.id)) {
    return errorResponse("You don't have edit access to this document", 403);
  }

  const version = await prisma.documentVersion.findUnique({ where: { id: versionId } });
  if (!version || version.documentId !== id) {
    return errorResponse("Version not found", 404);
  }

  await snapshotDocumentVersion(document, user.id);

  const updated = await prisma.document.update({
    where: { id },
    data: { title: version.title, content: version.content },
  });

  return NextResponse.json({ document: updated });
}
