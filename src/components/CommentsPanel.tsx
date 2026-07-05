"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string };
};

export function CommentsPanel({
  documentId,
  open,
  onOpenChange,
}: {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function loadComments() {
    const res = await fetch(`/api/documents/${documentId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
    }
  }

  useEffect(() => {
    if (open) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not post comment");
      setBody("");
      await loadComments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-64">
          <ul className="space-y-2">
            {comments.length === 0 && (
              <li className="text-xs text-muted-foreground">No comments yet.</li>
            )}
            {comments.map((comment) => (
              <li key={comment.id} className="border-b pb-2 text-sm">
                <p className="text-foreground/80">{comment.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {comment.author.name} · {new Date(comment.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <form onSubmit={submitComment} className="flex gap-2">
          <Textarea
            required
            rows={2}
            placeholder="Add a comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="resize-none"
          />
          <Button type="submit" disabled={pending} className="shrink-0 self-end">
            Post
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
