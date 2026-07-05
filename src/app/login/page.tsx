import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserPicker } from "@/components/UserPicker";

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Collab Docs</h1>
        <p className="mt-1 text-sm text-black/60">
          This demo uses mocked authentication — pick a seeded user to continue. No password required.
        </p>
      </div>
      <UserPicker users={users} />
    </main>
  );
}
