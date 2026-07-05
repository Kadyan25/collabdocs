"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; name: string; email: string };

export function UserPicker({ users }: { users: User[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectUser(userId: string) {
    setPendingId(userId);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not sign in");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setPendingId(null);
    }
  }

  return (
    <div className="grid gap-3">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => selectUser(user.id)}
          disabled={pendingId !== null}
          className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-left transition hover:border-black/30 hover:bg-black/[0.02] disabled:opacity-50"
        >
          <span>
            <span className="block font-medium">{user.name}</span>
            <span className="block text-sm text-black/60">{user.email}</span>
          </span>
          <span className="text-sm text-black/40">
            {pendingId === user.id ? "Signing in..." : "Continue"}
          </span>
        </button>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
