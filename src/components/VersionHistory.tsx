"use client";

import { useState } from "react";

type Version = {
  id: string;
  title: string;
  createdAt: string;
  createdBy: { name: string };
};

export function VersionHistory({
  documentId,
  canEdit,
}: {
  documentId: string;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadVersions() {
    const res = await fetch(`/api/documents/${documentId}/versions`);
    if (res.ok) {
      const data = await res.json();
      setVersions(data.versions);
    }
  }

  async function openPanel() {
    setOpen(true);
    setError(null);
    await loadVersions();
  }

  async function restore(versionId: string) {
    setRestoringId(versionId);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/versions/${versionId}/restore`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not restore version");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restore version");
      setRestoringId(null);
    }
  }

  if (!open) {
    return (
      <button
        onClick={openPanel}
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.03]"
      >
        History
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
        <h3 className="mb-2 text-sm font-medium">Version history</h3>
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {versions.length === 0 && (
            <li className="text-xs text-black/40">No saved versions yet — save an edit first.</li>
          )}
          {versions.map((version) => (
            <li
              key={version.id}
              className="flex items-center justify-between gap-2 border-b border-black/5 pb-2 text-xs"
            >
              <span className="text-black/70">
                {new Date(version.createdAt).toLocaleString()}
                <span className="block text-black/40">by {version.createdBy.name}</span>
              </span>
              {canEdit && (
                <button
                  onClick={() => restore(version.id)}
                  disabled={restoringId === version.id}
                  className="shrink-0 rounded border border-black/10 px-2 py-1 hover:bg-black/[0.03] disabled:opacity-50"
                >
                  {restoringId === version.id ? "Restoring..." : "Restore"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
