"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ACCEPTED = ".txt,.md";
const MAX_SIZE_BYTES = 1_000_000;

export function ImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (![".txt", ".md"].includes(extension)) {
      setError("Only .txt and .md files are supported");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("File is too large (1MB limit)");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not import file");
      router.push(`/documents/${data.document.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import file");
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.03] disabled:opacity-50"
      >
        {pending ? "Importing..." : "Import .txt/.md"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
