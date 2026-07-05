import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isOwner } from "@/lib/access";
import { shareDocumentSchema } from "@/lib/validation";
import { errorResponse } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Not signed in", 401);

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) return errorResponse("Document not found", 404);
  if (!isOwner(document, user.id)) {
    return errorResponse("Only the owner can view sharing settings", 403);
  }

  const shares = await prisma.documentShare.findMany({
    where: { documentId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ shares });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Not signed in", 401);

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) return errorResponse("Document not found", 404);
  if (!isOwner(document, user.id)) {
    return errorResponse("Only the owner can share this document", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = shareDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid email", 400);
  }

  const targetUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!targetUser) {
    return errorResponse("No user found with that email", 404);
  }
  if (targetUser.id === user.id) {
    return errorResponse("You already own this document", 409);
  }

  const existingShare = await prisma.documentShare.findUnique({
    where: { documentId_userId: { documentId: id, userId: targetUser.id } },
  });
  if (existingShare) {
    return errorResponse("Already shared with this user", 409);
  }

  const share = await prisma.documentShare.create({
    data: { documentId: id, userId: targetUser.id, role: parsed.data.role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ share }, { status: 201 });
}
