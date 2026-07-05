"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NewDocumentButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function createDocument() {
    setPending(true);
    try {
      const res = await fetch("/api/documents", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create document");
      router.push(`/documents/${data.document.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create document");
      setPending(false);
    }
  }

  return (
    <Button onClick={createDocument} disabled={pending}>
      {pending ? "Creating..." : "New Document"}
    </Button>
  );
}
