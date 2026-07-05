import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";
import { NewDocumentButton } from "@/components/NewDocumentButton";
import { ImportButton } from "@/components/ImportButton";
import { DocumentList } from "@/components/DocumentList";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [owned, shared] = await Promise.all([
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

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Collab Docs</h1>
          <p className="text-sm text-black/60">
            Signed in as {user.name} ({user.email})
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">My Documents</h2>
          <div className="flex items-center gap-2">
            <ImportButton />
            <NewDocumentButton />
          </div>
        </div>
        <p className="mb-3 text-xs text-black/40">
          Import supports .txt and .md files only, up to 1MB.
        </p>
        <DocumentList
          documents={owned}
          badge="Owner"
          emptyLabel="No documents yet — create one or import a .txt/.md file."
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Shared with Me</h2>
        <DocumentList
          documents={shared}
          badge="Shared"
          emptyLabel="Nothing has been shared with you yet."
        />
      </section>
    </main>
  );
}
