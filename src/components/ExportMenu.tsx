"use client";

export function ExportMenu({ documentId }: { documentId: string }) {
  return (
    <div className="flex items-center gap-1">
      <a
        href={`/api/documents/${documentId}/export?format=md`}
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.03]"
      >
        Export .md
      </a>
      <button
        onClick={() => window.print()}
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[0.03]"
      >
        Export PDF
      </button>
    </div>
  );
}
