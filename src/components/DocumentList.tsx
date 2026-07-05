import Link from "next/link";

type DocumentListItem = {
  id: string;
  title: string;
  updatedAt: Date;
  owner?: { name: string; email: string } | null;
};

export function DocumentList({
  documents,
  emptyLabel,
  badge,
}: {
  documents: DocumentListItem[];
  emptyLabel: string;
  badge: "Owner" | "Shared";
}) {
  if (documents.length === 0) {
    return <p className="text-sm text-black/50">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-black/10 rounded-lg border border-black/10">
      {documents.map((doc) => (
        <li key={doc.id}>
          <Link
            href={`/documents/${doc.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02]"
          >
            <div>
              <p className="font-medium">{doc.title}</p>
              {doc.owner && (
                <p className="text-xs text-black/50">Owned by {doc.owner.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-black/40">
                {new Date(doc.updatedAt).toLocaleString()}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  badge === "Owner" ? "bg-black/5 text-black/70" : "bg-blue-50 text-blue-700"
                }`}
              >
                {badge}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
