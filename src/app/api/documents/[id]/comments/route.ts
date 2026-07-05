import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessDocument } from "@/lib/access";
import { createCommentSchema } from "@/lib/validation";
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

  const comments = await prisma.comment.findMany({
    where: { documentId: id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ comments });
}

export async function POST(
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
  if (!canAccessDocument(document, document.shares, user.id)) {
    return errorResponse("You don't have access to this document", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid comment", 400);
  }

  const comment = await prisma.comment.create({
    data: { documentId: id, authorId: user.id, body: parsed.data.body },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
