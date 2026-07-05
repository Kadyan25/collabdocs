"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MoreHorizontal, MessageSquare, History as HistoryIcon } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { EditorToolbar } from "@/components/EditorToolbar";
import { ShareDialog } from "@/components/ShareDialog";
import { VersionHistory } from "@/components/VersionHistory";
import { ExportMenuItems } from "@/components/ExportMenu";
import { PresenceIndicator } from "@/components/PresenceIndicator";
import { CommentsPanel } from "@/components/CommentsPanel";

type DocumentData = {
  id: string;
  title: string;
  content: string;
};

type ActiveDialog = "share" | "history" | "comments" | null;

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
  const [saving, setSaving] = useState(false);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable: canEdit,
    extensions: [StarterKit],
    content: document.content,
    editorProps: {
      attributes: {
        class: "editor-content min-h-[50vh] px-4 py-4 focus:outline-none sm:px-6 sm:py-6 sm:text-lg",
      },
    },
  });

  async function save() {
    if (!editor) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: editor.getHTML() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Link>
          <PresenceIndicator documentId={document.id} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setActiveDialog("history")}
            title="Version history"
          >
            <HistoryIcon className="size-4" />
            <span className="sr-only">Version history</span>
          </Button>
          <Button variant="outline" onClick={() => setActiveDialog("comments")}>
            <MessageSquare className="size-4" />
            Comments
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "icon" })}>
              <MoreHorizontal />
              <span className="sr-only">More actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuItem onClick={() => setActiveDialog("share")}>
                  Share
                </DropdownMenuItem>
              )}
              <ExportMenuItems documentId={document.id} />
            </DropdownMenuContent>
          </DropdownMenu>
          {canEdit ? (
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          ) : (
            <Badge variant="secondary">View only</Badge>
          )}
        </div>
      </div>

      {isOwner && (
        <ShareDialog
          documentId={document.id}
          open={activeDialog === "share"}
          onOpenChange={(open) => setActiveDialog(open ? "share" : null)}
        />
      )}
      <VersionHistory
        documentId={document.id}
        canEdit={canEdit}
        open={activeDialog === "history"}
        onOpenChange={(open) => setActiveDialog(open ? "history" : null)}
      />
      <CommentsPanel
        documentId={document.id}
        open={activeDialog === "comments"}
        onOpenChange={(open) => setActiveDialog(open ? "comments" : null)}
      />

      {!isOwner && (
        <p className="mb-4 text-sm text-muted-foreground">
          Shared with you by {ownerName} —{" "}
          {canEdit ? "you can edit and save this document." : "you have view-only access."}
        </p>
      )}

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        readOnly={!canEdit}
        className="mb-4 h-auto border-none px-0 text-2xl font-semibold shadow-none focus-visible:ring-0 sm:text-3xl md:text-3xl"
        placeholder="Untitled Document"
      />

      <div className="print:border-0 rounded-lg border">
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
