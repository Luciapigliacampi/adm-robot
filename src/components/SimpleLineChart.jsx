export default function SimpleLineChart({ data = [], maxPoints = 120 }) {
  const w = 360, h = 120, pad = 16;
  const pts = data.slice(-maxPoints);
  const xs = (i) => pad + (i * (w - 2*pad)) / Math.max(1, pts.length - 1);
  const min = Math.min(...pts.map(p => p.battery ?? 0), 0);
  const max = Math.max(...pts.map(p => p.battery ?? 0), 100);
  const ys = (v) => h - pad - ((v - min) * (h - 2*pad)) / Math.max(1, (max - min || 1));

  const path = pts.map((p, i) => `${i===0?'M':'L'} ${xs(i)} ${ys(p.battery ?? 0)}`).join(' ');

  return (
    <div className="card">
      <div className="card-title">Telemetría (Batería)</div>
      <svg width={w} height={h} role="img">
        <rect x="0" y="0" width={w} height={h} fill="none" stroke="var(--border)"/>
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2"/>
      </svg>
      <div className="muted small">min {Math.round(min)}% · max {Math.round(max)}%</div>
    </div>
  );
}
