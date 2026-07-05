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
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">Collab Docs</h1>
        <p className="mt-2 text-base text-muted-foreground">
          This demo uses mocked authentication — pick a seeded user to continue. No password required.
        </p>
      </div>
      <UserPicker users={users} />
    </main>
  );
}
