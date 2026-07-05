"use client";

import { useState } from "react";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "@/components/EditorToolbar";
import { ShareDialog } from "@/components/ShareDialog";

type DocumentData = {
  id: string;
  title: string;
  content: string;
};

export function DocumentEditor({
  document,
  isOwner,
  ownerName,
}: {
  document: DocumentData;
  isOwner: boolean;
  ownerName: string;
}) {
  const [title, setTitle] = useState(document.title);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: document.content,
    editorProps: {
      attributes: {
        class: "editor-content min-h-[50vh] px-4 py-4 focus:outline-none",
      },
    },
  });

  async function save() {
    if (!editor) return;
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: editor.getHTML() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-black/50 hover:text-black">
          ← Back to dashboard
        </Link>
        <div className="flex items-center gap-3">
          {isOwner && <ShareDialog documentId={document.id} />}
          <span className="text-xs text-black/40">
            {status === "saving" && "Saving..."}
            {status === "saved" && "Saved"}
            {status === "error" && <span className="text-red-600">{error}</span>}
          </span>
          <button
            onClick={save}
            disabled={status === "saving"}
            className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-black/80 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      {!isOwner && (
        <p className="mb-3 text-xs text-black/50">
          Shared with you by {ownerName} — you can edit and save this document.
        </p>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-3 w-full border-none text-2xl font-semibold outline-none"
        placeholder="Untitled Document"
      />

      <div className="rounded-lg border border-black/10">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}
