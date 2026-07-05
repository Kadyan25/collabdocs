"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Version = {
  id: string;
  title: string;
  createdAt: string;
  createdBy: { name: string };
};

export function VersionHistory({
  documentId,
  canEdit,
  open,
  onOpenChange,
}: {
  documentId: string;
  canEdit: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  async function loadVersions() {
    const res = await fetch(`/api/documents/${documentId}/versions`);
    if (res.ok) {
      const data = await res.json();
      setVersions(data.versions);
    }
  }

  useEffect(() => {
    if (open) loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function restore(versionId: string) {
    setRestoringId(versionId);
    try {
      const res = await fetch(`/api/documents/${documentId}/versions/${versionId}/restore`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not restore version");
      toast.success("Version restored");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not restore version");
      setRestoringId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>
            Every save keeps a snapshot. Restoring also snapshots the current state first.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-72">
          <ul className="space-y-2">
            {versions.length === 0 && (
              <li className="text-xs text-muted-foreground">
                No saved versions yet — save an edit first.
              </li>
            )}
            {versions.map((version) => (
              <li
                key={version.id}
                className="flex items-center justify-between gap-2 border-b pb-2 text-sm"
              >
                <span className="text-foreground/80">
                  {new Date(version.createdAt).toLocaleString()}
                  <span className="block text-xs text-muted-foreground">
                    by {version.createdBy.name}
                  </span>
                </span>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => restore(version.id)}
                    disabled={restoringId === version.id}
                  >
                    {restoringId === version.id ? "Restoring..." : "Restore"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
