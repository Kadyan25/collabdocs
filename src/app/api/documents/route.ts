import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createDocumentSchema } from "@/lib/validation";
import { errorResponse } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Not signed in", 401);

  const [owned, sharedWithMe] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId: user.id } } },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ owned, shared: sharedWithMe });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Not signed in", 401);

  const body = await request.json().catch(() => ({}));
  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Invalid title", 400);
  }

  const document = await prisma.document.create({
    data: {
      title: parsed.data.title?.trim() || "Untitled Document",
      content: "",
      ownerId: user.id,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
