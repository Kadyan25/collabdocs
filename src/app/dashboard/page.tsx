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
      include: {
        owner: { select: { name: true, email: true } },
        shares: { where: { userId: user.id }, select: { role: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const sharedWithRole = shared.map((doc) => ({
    ...doc,
    role: doc.shares[0]?.role ?? "VIEWER",
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Collab Docs</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Signed in as {user.name} ({user.email})
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="mb-10">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-medium">My Documents</h2>
          <div className="flex items-center gap-2">
            <ImportButton />
            <NewDocumentButton />
          </div>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Import supports .txt and .md files only, up to 1MB.
        </p>
        <DocumentList
          documents={owned}
          badge="Owner"
          emptyLabel="No documents yet — create one or import a .txt/.md file."
        />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-medium">Shared with Me</h2>
        <DocumentList
          documents={sharedWithRole}
          badge="Shared"
          emptyLabel="Nothing has been shared with you yet."
        />
      </section>
    </main>
  );
}
