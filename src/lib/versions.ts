import { prisma } from "@/lib/prisma";

const MAX_VERSIONS_PER_DOCUMENT = 20;

export async function snapshotDocumentVersion(
  document: { id: string; title: string; content: string },
  createdById: string
) {
  await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      title: document.title,
      content: document.content,
      createdById,
    },
  });

  const overflow = await prisma.documentVersion.findMany({
    where: { documentId: document.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
    skip: MAX_VERSIONS_PER_DOCUMENT,
  });

  if (overflow.length > 0) {
    await prisma.documentVersion.deleteMany({
      where: { id: { in: overflow.map((v) => v.id) } },
    });
  }
}
