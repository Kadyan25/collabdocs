"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.03]"
    >
      Switch user
    </button>
  );
}
