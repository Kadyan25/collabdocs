"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ACCEPTED = ".txt,.md";
const MAX_SIZE_BYTES = 1_000_000;

export function ImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (![".txt", ".md"].includes(extension)) {
      toast.error("Only .txt and .md files are supported");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File is too large (1MB limit)");
      return;
    }

    setPending(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not import file");
      router.push(`/documents/${data.document.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not import file");
      setPending(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={pending}>
        {pending ? "Importing..." : "Import .txt/.md"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
