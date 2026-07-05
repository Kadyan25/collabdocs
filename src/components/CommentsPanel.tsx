"use client";

import { useState } from "react";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string };
};

export function CommentsPanel({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadComments() {
    const res = await fetch(`/api/documents/${documentId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
    }
  }

  async function openPanel() {
    setOpen(true);
    setError(null);
    await loadComments();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
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
      setError(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={openPanel}
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.03]"
      >
        Comments
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
        <h3 className="mb-2 text-sm font-medium">Comments</h3>
        <ul className="mb-3 max-h-64 space-y-2 overflow-y-auto">
          {comments.length === 0 && (
            <li className="text-xs text-black/40">No comments yet.</li>
          )}
          {comments.map((comment) => (
            <li key={comment.id} className="border-b border-black/5 pb-2 text-xs">
              <p className="text-black/70">{comment.body}</p>
              <p className="mt-1 text-black/40">
                {comment.author.name} · {new Date(comment.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <form onSubmit={submitComment} className="flex gap-2">
          <textarea
            required
            rows={2}
            placeholder="Add a comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full resize-none rounded border border-black/10 px-2 py-1 text-sm outline-none focus:border-black/30"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 self-end rounded bg-black px-2.5 py-1 text-sm text-white disabled:opacity-50"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
