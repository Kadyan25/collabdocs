import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";
import { ALLOWED_IMPORT_EXTENSIONS, MAX_IMPORT_SIZE_BYTES } from "@/lib/validation";
import { convertImportedFileToHtml, titleFromFilename } from "@/lib/import";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Not signed in", 401);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return errorResponse("No file provided", 400);
  }

  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!ALLOWED_IMPORT_EXTENSIONS.includes(extension as ".txt" | ".md")) {
    return errorResponse("Only .txt and .md files are supported", 400);
  }

  if (file.size > MAX_IMPORT_SIZE_BYTES) {
    return errorResponse("File is too large (1MB limit)", 400);
  }

  const text = await file.text();
  const content = convertImportedFileToHtml(file.name, text);

  const document = await prisma.document.create({
    data: {
      title: titleFromFilename(file.name),
      content,
      ownerId: user.id,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
