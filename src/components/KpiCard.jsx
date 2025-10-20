export default function KpiCard({ label, value, unit }) {
  return (
    <div className="card kpi">
      <div className="kpi-value">
        {value ?? "—"} {value != null && unit ? <span className="unit">{unit}</span> : null}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
