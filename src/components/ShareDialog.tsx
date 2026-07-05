"use client";

import { useState } from "react";

type Role = "VIEWER" | "EDITOR";
type Share = { id: string; role: Role; user: { name: string; email: string } };

export function ShareDialog({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false);
  const [shares, setShares] = useState<Share[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("EDITOR");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadShares() {
    const res = await fetch(`/api/documents/${documentId}/share`);
    if (res.ok) {
      const data = await res.json();
      setShares(data.shares);
    }
  }

  async function openDialog() {
    setOpen(true);
    setError(null);
    await loadShares();
  }

  async function submitShare(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not share");
      setEmail("");
      await loadShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not share");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={openDialog}
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.03]"
      >
        Share
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(false)}
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.03]"
      >
        Close
      </button>
      <div className="absolute right-0 top-10 z-10 w-80 rounded-lg border border-black/10 bg-white p-4 shadow-lg">
        <h3 className="mb-2 text-sm font-medium">Share this document</h3>
        <form onSubmit={submitShare} className="mb-3 flex gap-2">
          <input
            type="email"
            required
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-black/10 px-2 py-1 text-sm outline-none focus:border-black/30"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="rounded border border-black/10 px-1 py-1 text-sm outline-none"
          >
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-black px-2.5 py-1 text-sm text-white disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <ul className="space-y-1">
          {shares.length === 0 && (
            <li className="text-xs text-black/40">Not shared with anyone yet.</li>
          )}
          {shares.map((share) => (
            <li key={share.id} className="flex items-center justify-between text-xs text-black/70">
              <span>
                {share.user.name} ({share.user.email})
              </span>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase text-black/50">
                {share.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
