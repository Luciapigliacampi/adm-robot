export default function StatusBar({ latencyMs, telemetry, connected }) {
  const badge = (txt) => <span className="badge">{txt}</span>;
  const lat = latencyMs == null ? "—" : `${latencyMs} ms`;
  return (
    <div className="statusbar">
      {badge("Admin")}
      <span> Batería: <b>{telemetry?.battery ?? "—"}%</b></span>
      <span> Estado: <b>{telemetry?.status ?? "—"}</b></span>
      <span> Modo: <b>{telemetry?.mode ?? "—"}</b></span>
      <span> Torre: <b>{telemetry?.mast ?? "—"}</b></span>
      <span className={`lat ${connected ? 'ok':'err'}`}>{lat}</span>
    </div>
  );
}
