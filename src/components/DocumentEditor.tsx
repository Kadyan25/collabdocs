"use client";

import { useState } from "react";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "@/components/EditorToolbar";
import { ShareDialog } from "@/components/ShareDialog";
import { VersionHistory } from "@/components/VersionHistory";
import { ExportMenu } from "@/components/ExportMenu";
import { PresenceIndicator } from "@/components/PresenceIndicator";

type DocumentData = {
  id: string;
  title: string;
  content: string;
};

export function DocumentEditor({
  document,
  isOwner,
  canEdit,
  ownerName,
}: {
  document: DocumentData;
  isOwner: boolean;
  canEdit: boolean;
  ownerName: string;
}) {
  const [title, setTitle] = useState(document.title);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable: canEdit,
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
      <div className="no-print mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-black/50 hover:text-black">
            ← Back to dashboard
          </Link>
          <PresenceIndicator documentId={document.id} />
        </div>
        <div className="flex items-center gap-3">
          {isOwner && <ShareDialog documentId={document.id} />}
          <VersionHistory documentId={document.id} canEdit={canEdit} />
          <ExportMenu documentId={document.id} />
          {canEdit && (
            <span className="text-xs text-black/40">
              {status === "saving" && "Saving..."}
              {status === "saved" && "Saved"}
              {status === "error" && <span className="text-red-600">{error}</span>}
            </span>
          )}
          {canEdit ? (
            <button
              onClick={save}
              disabled={status === "saving"}
              className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-black/80 disabled:opacity-50"
            >
              Save
            </button>
          ) : (
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-black/60">
              View only
            </span>
          )}
        </div>
      </div>

      {!isOwner && (
        <p className="mb-3 text-xs text-black/50">
          Shared with you by {ownerName} —{" "}
          {canEdit ? "you can edit and save this document." : "you have view-only access."}
        </p>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        readOnly={!canEdit}
        className="mb-3 w-full border-none text-2xl font-semibold outline-none"
        placeholder="Untitled Document"
      />

      <div className="print:border-0 rounded-lg border border-black/10">
        {canEdit && (
          <div className="no-print">
            <EditorToolbar editor={editor} />
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}
