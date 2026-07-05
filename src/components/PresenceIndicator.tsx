"use client";

import { useEffect, useState } from "react";

const HEARTBEAT_INTERVAL_MS = 5_000;

export function PresenceIndicator({ documentId }: { documentId: string }) {
  const [viewers, setViewers] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function heartbeat() {
      await fetch(`/api/documents/${documentId}/presence`, { method: "POST" }).catch(() => {});
    }

    async function poll() {
      const res = await fetch(`/api/documents/${documentId}/presence`).catch(() => null);
      if (res?.ok && !cancelled) {
        const data = await res.json();
        setViewers(data.viewers);
      }
    }

    heartbeat();
    poll();
    const interval = setInterval(() => {
      heartbeat();
      poll();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [documentId]);

  if (viewers.length === 0) return null;

  return (
    <span className="text-xs text-black/50">
      {viewers.length === 1
        ? `${viewers[0]} is also viewing`
        : `${viewers.join(", ")} are also viewing`}
    </span>
  );
}
