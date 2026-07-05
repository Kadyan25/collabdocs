import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

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
        <h2 className="mb-3 text-lg font-medium">My Documents</h2>
        <p className="text-sm text-black/50">Coming next: create/list/open your documents.</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Shared with Me</h2>
        <p className="text-sm text-black/50">Coming next: documents others have shared with you.</p>
      </section>
    </main>
  );
}
