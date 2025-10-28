// src/components/KpiCard.jsx
export default function KpiCard({
  title,
  value,        // number | string | null
  unit,         // "%", "m/s", "m", "km/h", etc.
  hint,
  ok,
  digits = 0,   // cuántos decimales mostrar si value es número
}) {
  const n = typeof value === "number" ? value
          : (typeof value === "string" && value.trim() !== "" && !isNaN(+value) ? +value : null);

  const display = (n !== null && isFinite(n)) ? n.toFixed(digits)
                  : (value ?? "—"); // si viene string tipo "Conectado", lo muestra; si null/undefined → "—"

  return (
    <div className="card" style={{
      display: "grid", alignContent: "center", gap: 6, minHeight: 96, padding: 16,
      borderLeft: ok === undefined ? undefined : `4px solid ${ok ? "#10b981" : "#ef4444"}`
    }}>
      <div className="muted small" style={{ fontWeight: 700 }}>{title}</div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{display}</div>
        {unit ? <div className="muted" style={{ fontSize: 14, fontWeight: 700 }}>{unit}</div> : null}
      </div>

      {hint ? <div className="muted small" style={{ marginTop: 2 }}>{hint}</div> : null}
    </div>
  );
}
