// src/pages/RobotSelector.jsx
import React, { useEffect, useState } from "react";
import { Zap, CornerDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchRobotsFromApi } from "../services/robots";
import { aliasName, setAliasDbId } from "../config/robotAliases";


export default function RobotSelector() {
  const navigate = useNavigate();
  const [robots, setRobots] = useState([]);

  useEffect(() => {
    (async () => {
const realFromEnv = import.meta.env.VITE_ROBOT_ID || "R1";
      const real = await fetchRobotsFromApi().catch(() => []);
      const r1db = Array.isArray(real) && real.length ? (real[0].dbId || null) : null;
      const list = [
        { alias: "R1", name: aliasName.R1, status: "En espera", battery: 92, dbId: r1db ?? realFromEnv, fake: !r1db },
        { alias: "R2", name: aliasName.R2, status: "En ruta",  battery: 65, dbId: null, fake: true },
        { alias: "R3", name: aliasName.R3, status: "Offline",  battery: 33, dbId: null, fake: true },
      ];
      setRobots(list);

    })();
  }, []);

  const handleRobotSelect = (alias) => navigate(`/dashboard/${alias}`);

  return (
    <main className="main selector-page">
      <div className="card title-card">
        <h1>Selección de Robot</h1>
        <p className="muted">Selecciona el robot para acceder al panel de administración y telemetría.</p>
      </div>

      <div className="robot-grid">
        {robots.map((robot) => (
          <div
            key={robot.alias}
            className="card robot-card"
            onClick={() => handleRobotSelect(robot.alias)}
          >
            <Zap size={36} color="var(--accent)" />
            <h2>{robot.name}</h2>

            <div className="status-row">
              <span className={
                "status-badge " +
                (robot.status?.includes("ruta")
                  ? "ok"
                  : robot.status?.includes("Inactivo")
                  ? "err"
                  : "warn")
              }>
                {String(robot.status || "—").toUpperCase()}
              </span>
              <span className="battery-info">Batería: {robot.battery ?? "—"}%</span>
            </div>

            <CornerDownRight size={24} color="var(--accent)" className="select-icon" />
          </div>
        ))}
      </div>
    </main>
  );
}
