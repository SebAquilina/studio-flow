"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toast";

export function RunPulseButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/insights?action=run", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showToast({ kind: "success", message: "Pulse regenerated" });
      router.refresh();
    } catch (e) {
      showToast({ kind: "error", message: `Pulse failed: ${(e as Error).message}` });
    } finally { setBusy(false); }
  }
  return (
    <button type="button" className="btn btn-primary" onClick={run} disabled={busy}>
      {busy ? "Generating…" : "Run Pulse →"}
    </button>
  );
}
