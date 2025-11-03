// src/components/KpiCard.jsx
import React from "react";

/**
 * Props:
 *  - title: string (etiqueta)
 *  - value: string|number (valor principal)
 *  - unit / suffix: string opcional (por ejemplo "%", "ms", "km/h")
 *  - hint: string opcional (línea chica debajo, ej: "23 ms")
 *  - ok: boolean opcional (true = estado OK, false = alerta; colorea el borde/indicador)
 */
export default function KpiCard({ title, value, unit, suffix, hint, ok }) {
  const suf = unit ?? suffix ?? "";
  const isOk = ok === undefined ? null : !!ok;

  const border =
    isOk === null ? "1px solid rgba(255,255,255,.08)" : isOk ? "1px solid rgba(34,197,94,.45)" : "1px solid rgba(239,68,68,.45)";
  const glow =
    isOk === null ? "none" : isOk ? "0 0 0 1px rgba(34,197,94,.25) inset" : "0 0 0 1px rgba(239,68,68,.25) inset";

  return (
    <div
      className="card"
      style={{
        border,
        boxShadow: glow,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 90,
      }}
    >
      <div style={{ color: "#9aa4b2", fontSize: 12 }}>{title}</div>

      <div style={{ fontSize: 22, fontWeight: 700, display: "flex", alignItems: "baseline", gap: 6 }}>
        <span>{value ?? "—"}</span>
        {suf && <span style={{ fontSize: 12, color: "#9aa4b2" }}>{suf}</span>}
      </div>

      {hint ? (
        <div style={{ fontSize: 12, color: "#9aa4b2", marginTop: 2 }}>
          {hint}
        </div>
      ) : null}

      {/* Indicador lateral de estado (opcional) */}
      {isOk !== null && (
        <div
          aria-hidden
          style={{
            marginTop: 4,
            height: 4,
            borderRadius: 999,
            background: isOk ? "linear-gradient(90deg, #16a34a, #22c55e)" : "linear-gradient(90deg, #ef4444, #f43f5e)",
            opacity: 0.85,
          }}
        />
      )}
    </div>
  );
}
