"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "VIEWER" | "EDITOR";
type Share = { id: string; role: Role; user: { name: string; email: string } };

export function ShareDialog({
  documentId,
  open,
  onOpenChange,
}: {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [shares, setShares] = useState<Share[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("EDITOR");
  const [pending, setPending] = useState(false);

  async function loadShares() {
    const res = await fetch(`/api/documents/${documentId}/share`);
    if (res.ok) {
      const data = await res.json();
      setShares(data.shares);
    }
  }

  useEffect(() => {
    if (open) loadShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submitShare(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not share");
      toast.success(`Shared with ${email} as ${role.toLowerCase()}`);
      setEmail("");
      await loadShares();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not share");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this document</DialogTitle>
          <DialogDescription>
            Grant a seeded user access as a viewer (read-only) or editor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submitShare} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            required
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex gap-2">
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={pending}>
              Add
            </Button>
          </div>
        </form>
        <ul className="space-y-1.5">
          {shares.length === 0 && (
            <li className="text-xs text-muted-foreground">Not shared with anyone yet.</li>
          )}
          {shares.map((share) => (
            <li key={share.id} className="flex items-center justify-between text-sm">
              <span>
                {share.user.name} ({share.user.email})
              </span>
              <Badge variant="secondary">{share.role}</Badge>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
