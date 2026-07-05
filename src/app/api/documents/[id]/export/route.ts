import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessDocument } from "@/lib/access";
import { errorResponse } from "@/lib/api-response";
import { htmlToMarkdown, slugifyFilename } from "@/lib/export";

export async function GET(
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

  const format = request.nextUrl.searchParams.get("format");
  if (format !== "md") {
    return errorResponse("Only format=md is supported", 400);
  }

  const markdown = `# ${document.title}\n\n${htmlToMarkdown(document.content)}`;
  const filename = `${slugifyFilename(document.title)}.md`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
