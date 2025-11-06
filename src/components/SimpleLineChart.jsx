// src/components/SimpleLineChart.jsx
export default function SimpleLineChart({ data = [], maxPoints = 120, width = 360, height = 120 }) {
  const w = width, h = height, pad = 16;
  const pts = (Array.isArray(data) ? data : []).slice(-maxPoints);

  // Normalizar valor numérico (acepta p.battery o p.y)
const val = (p) => {
    // Prioriza p.y (distancia) si existe.
    const v = (p?.y ?? p?.battery ?? 0);
    return typeof v === 'number' ? v : Number(v) || 0;
  };

  const min = Math.min(...pts.map(val), 0);
  // Escala máxima dinámica basada en la distancia observada, asegurando un mínimo de 10m
  const maxObserved = Math.max(...pts.map(val), 0) || 10;
  const max = Math.max(10, maxObserved * 1.05);

  const xs = (i) => pad + (i * (w - 2 * pad)) / Math.max(1, pts.length - 1);
  const ys = (v) => h - pad - ((v - min) * (h - 2 * pad)) / Math.max(1, (max - min) || 1);

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(val(p))}`).join(' ');

  return (
    <div className="card">
      {/* CORREGIDO: Título y unidad */}
      <div className="card-title">Telemetría (Distancia Recorrida - metros)</div>
      <svg width={w} height={h} role="img">
        <rect x="0" y="0" width={w} height={h} fill="none" stroke="var(--border)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
      </svg>
      {/* CORREGIDO: Unidades */}
      <div className="muted small">min {Math.round(min)}m · max {Math.round(maxObserved)}m</div>
    </div>
  );
}