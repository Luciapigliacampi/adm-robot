import React from 'react';

export default function StatusBar({ latencyMs, telemetry, connected }) {
  const badge = (txt, isOk) => <span className={`badge ${isOk ? 'ok' : 'err'}`}>{txt}</span>;
  const lat = latencyMs == null ? "—" : `${latencyMs} ms`;
  
  const status = telemetry?.status?.toUpperCase() ?? "—";
  const statusClass = status === 'EXECUTING_TASK' ? 'ok' : (status === 'WAITING' ? 'warn' : 'err');

  return (
    <div className="statusbar">
      {badge("Admin", true)}
      <span> Conexión: {connected ? badge("CONECTADO", true) : badge("DESCONECTADO", false)}</span>
      <span className={`status-badge ${statusClass}`}>{status}</span>
      <span> Modo: <b>{telemetry?.mode?.toUpperCase() ?? "—"}</b></span>
      <span> Torre: <b>{telemetry?.mast?.toUpperCase() ?? "—"}</b></span>
      <span className={`lat ${connected ? 'ok':'err'}`}>{lat}</span>
    </div>
  );
}