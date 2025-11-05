// src/pages/RobotSelector.jsx
import { Zap, CornerDownRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRobotsFromApi } from "../services/robots";
import { aliasName } from "../config/robotAliases";

export default function RobotSelector() {
  const navigate = useNavigate();
  const [robots, setRobots] = useState([]);

  useEffect(() => {
    (async () => {
      const realFromEnv = import.meta.env.VITE_ROBOT_ID || "R1";
      const real = await fetchRobotsFromApi().catch(() => []);
      const r1db = Array.isArray(real) && real.length ? (real[0].dbId || null) : null;
      setRobots([
        { alias: "R1", name: aliasName.R1, status: "En espera", battery: 92, dbId: r1db ?? realFromEnv, fake: !r1db },
        { alias: "R2", name: aliasName.R2, status: "En ruta",  battery: 65, dbId: null, fake: true },
        { alias: "R3", name: aliasName.R3, status: "Offline",  battery: 33, dbId: null, fake: true },
      ]);
    })();
  }, []);

  return (
    <main className="selector-page">
      <div className="robot-grid">
        {robots.map(r => (
          <div key={r.alias} className="robot-card" onClick={() => navigate(`/dashboard/${r.alias}`)}>
            <Zap />
            <h2>{r.name}</h2>
            <div className="status-row">
              <span className={`status-badge ${r.status === 'En ruta' ? 'warn' : r.status === 'Offline' ? 'err' : 'ok'}`}>
                {r.status}
              </span>
              <span className="battery-info">{r.battery}%</span>
            </div>
            <CornerDownRight className="select-icon" />
          </div>
        ))}
      </div>
    </main>
  );
}
