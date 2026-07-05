"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function ExportMenuItems({ documentId }: { documentId: string }) {
  return (
    <>
      <DropdownMenuItem
        render={<a href={`/api/documents/${documentId}/export?format=md`} />}
      >
        Export .md
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => window.print()}>Export PDF</DropdownMenuItem>
    </>
  );
}
