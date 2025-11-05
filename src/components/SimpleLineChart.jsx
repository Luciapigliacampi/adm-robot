// src/components/SimpleLineChart.jsx
export default function SimpleLineChart({ data = [], maxPoints = 120, width = 360, height = 120 }) {
  const w = width, h = height, pad = 16;
  const pts = (Array.isArray(data) ? data : []).slice(-maxPoints);

  // Normalizar valor numérico (acepta p.battery o p.y)
  const val = (p) => {
    const v = (p?.battery ?? p?.y ?? 0);
    return typeof v === 'number' ? v : Number(v) || 0;
  };

  const min = Math.min(...pts.map(val), 0);
  const max = Math.max(...pts.map(val), 100);

  const xs = (i) => pad + (i * (w - 2 * pad)) / Math.max(1, pts.length - 1);
  const ys = (v) => h - pad - ((v - min) * (h - 2 * pad)) / Math.max(1, (max - min) || 1);

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(val(p))}`).join(' ');

  return (
    <div className="card">
      <div className="card-title">Telemetría (Batería)</div>
      <svg width={w} height={h} role="img">
        <rect x="0" y="0" width={w} height={h} fill="none" stroke="var(--border)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
      </svg>
      <div className="muted small">min {Math.round(min)}% · max {Math.round(max)}%</div>
    </div>
  );
}
