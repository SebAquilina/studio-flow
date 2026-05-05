"use client";
import { useEffect, useState } from "react";

type Toast = { id: number; kind: "success" | "error" | "info"; message: string };

let listeners: ((t: Toast) => void)[] = [];
let nextId = 1;

export function showToast(t: Omit<Toast, "id">) {
  const toast: Toast = { ...t, id: nextId++ };
  listeners.forEach((fn) => fn(toast));
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((p) => [...p, t]);
      setTimeout(() => setToasts((p) => p.filter((x) => x.id !== t.id)), 4000);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);
  return (
    <div style={{ position: "fixed", top: 16, right: 16, display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}>
      {toasts.map((t) => (
        <div key={t.id} role={t.kind === "error" ? "alert" : "status"}
          style={{ background: t.kind === "error" ? "#fee" : t.kind === "success" ? "#efe" : "#eef", color: "#222", padding: "10px 14px", borderRadius: 6, fontSize: 14, maxWidth: 360, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
