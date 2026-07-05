"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

type User = { id: string; name: string; email: string };

export function UserPicker({ users }: { users: User[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function selectUser(userId: string) {
    setPendingId(userId);
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
      toast.error(err instanceof Error ? err.message : "Could not sign in");
      setPendingId(null);
    }
  }

  return (
    <div className="grid gap-3">
      {users.map((user) => (
        <Card key={user.id} className="p-0">
          <button
            onClick={() => selectUser(user.id)}
            disabled={pendingId !== null}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-accent disabled:opacity-50"
          >
            <span>
              <span className="block font-medium">{user.name}</span>
              <span className="block text-sm text-muted-foreground">{user.email}</span>
            </span>
            <span className="text-sm text-muted-foreground">
              {pendingId === user.id ? "Signing in..." : "Continue"}
            </span>
          </button>
        </Card>
      ))}
    </div>
  );
}
