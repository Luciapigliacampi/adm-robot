import React from "react";
// Se asume que los íconos se pasan como prop

export default function KpiCard({ label, value, unit, icon: Icon }) {
  const displayValue = value == null ? "—" : value;
  return (
    <div className="card kpi">
      <div className="kpi-icon">{Icon && <Icon size={32} />}</div>
      <div className="kpi-value">
        {displayValue} {value != null && unit ? <span className="unit">{unit}</span> : null}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}