// src/hooks/useNativeNotify.js
import { useEffect } from "react";

export function useNativeNotify() {
  const ensurePermission = async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const res = await Notification.requestPermission();
      return res === "granted";
    }
    return false;
  };

  const show = async ({ title, body }) => {
    try {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      new Notification(title, { body, icon: "/icon-192.png" });
    } catch {}
  };

  return { ensurePermission, show };
}

export function useNotifyFromLogs(logs, { show }) {
  useEffect(() => {
    if (!logs?.length) return;
    const last = logs[0];
    if (last.type === "robot_error") {
      const msg = typeof last.data === "string" ? last.data : last.data?.message || "Error del robot";
      show({ title: "⚠️ Robot Error", body: msg });
    }
  }, [logs, show]);
}
