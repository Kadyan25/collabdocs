"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewDocumentButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createDocument() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/documents", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create document");
      router.push(`/documents/${data.document.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create document");
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={createDocument}
        disabled={pending}
        className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-black/80 disabled:opacity-50"
      >
        {pending ? "Creating..." : "New Document"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
