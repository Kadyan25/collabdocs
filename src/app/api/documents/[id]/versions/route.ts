import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessDocument } from "@/lib/access";
import { errorResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
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

  const versions = await prisma.documentVersion.findMany({
    where: { documentId: id },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  return NextResponse.json({ versions });
}
