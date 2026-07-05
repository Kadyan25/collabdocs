import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DocumentListItem = {
  id: string;
  title: string;
  updatedAt: Date;
  owner?: { name: string; email: string } | null;
  role?: "VIEWER" | "EDITOR";
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
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-0">
          <Link
            href={`/documents/${doc.id}`}
            className="flex flex-col gap-2 px-5 py-4 hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-base font-medium">{doc.title}</p>
              {doc.owner && (
                <p className="text-xs text-muted-foreground">Owned by {doc.owner.name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(doc.updatedAt).toLocaleString()}
              </span>
              <Badge variant={badge === "Owner" ? "outline" : "secondary"}>
                {badge}
                {doc.role ? ` · ${doc.role === "EDITOR" ? "Editor" : "Viewer"}` : ""}
              </Badge>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
}
