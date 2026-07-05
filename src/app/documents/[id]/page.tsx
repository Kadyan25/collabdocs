import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessDocument, isOwner } from "@/lib/access";
import { DocumentEditor } from "@/components/DocumentEditor";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
    include: { shares: true, owner: { select: { name: true } } },
  });

  if (!document) notFound();
  if (!canAccessDocument(document, document.shares, user.id)) {
    notFound();
  }

  return (
    <DocumentEditor
      document={{ id: document.id, title: document.title, content: document.content }}
      isOwner={isOwner(document, user.id)}
      ownerName={document.owner.name}
    />
  );
}
