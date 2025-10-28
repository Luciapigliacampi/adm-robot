// src/pages/RobotSelector.jsx
import React, { useEffect, useState } from "react";
import { Zap, CornerDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchRobotsFromApi } from "../services/robots";
import { setAliasDbId } from "../config/robotAliases";

export default function RobotSelector() {
  const navigate = useNavigate();
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await fetchRobotsFromApi();

      // Opcional: guardamos el mapeo alias↔dbId para usar después
      list.forEach(r => {
        if (r.dbId && r.name) setAliasDbId(r.name, r.dbId);
      });

      if (alive) {
        setRobots(list);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleRobotSelect = (id) => navigate(`/dashboard/${id}`);

  return (
    <main className="main selector-page">
      <div className="card title-card">
        <h1>Selección de Robot</h1>
        <p className="muted">Selecciona el robot para acceder al panel de administración y telemetría.</p>
      </div>

      {loading ? (
        <div className="card">Cargando robots…</div>
      ) : robots.length === 0 ? (
        <div className="card">
          <b>No hay robots para mostrar.</b>
          <div className="muted" style={{ marginTop: 6 }}>
            Verifica que <code>VITE_API_BASE</code> apunte al backend o usa el fallback configurando <code>VITE_ROBOT_ID</code>.
          </div>
        </div>
      ) : (
        <div className="grid robot-grid">
          {robots.map(robot => (
            <div
              key={robot.id}
              className="card robot-card"
              onClick={() => handleRobotSelect(robot.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter") && handleRobotSelect(robot.id)}
            >
              <Zap size={36} />
              <h2>{robot.name}</h2>
              <div className="status-row">
                <span className={`status-badge ${
                  robot.status?.toLowerCase().includes("ruta") ? "ok" :
                  robot.status?.toLowerCase().includes("inact") ? "err" : "warn"
                }`}>
                  {robot.status?.toUpperCase() ?? "EN ESPERA"}
                </span>
                <span className="battery-info">Batería: {robot.battery}%</span>
              </div>
              <CornerDownRight size={24} className="select-icon" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
