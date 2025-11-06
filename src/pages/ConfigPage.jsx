import { useEffect, useState } from "react";
import useAdminAPI from "../hooks/useAdminAPI";
import { useParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { getRobotAlias } from "../config/robotAliases";

export default function ConfigPage() {
  const { robotId } = useParams();
  const robotAlias = getRobotAlias(robotId) || robotId;

  const api = useAdminAPI();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState({
    brand: { primary: "#30509e", ink: "#13192e", accent: "#89bad7" },
    robot: { streamIntervalMs: 2000, autoStart: false },
    system: { cors: ["http://localhost:5173"], enablePush: false, vapidPublicKey: "" },
  });

  // 🛑 Placeholder si no hay robot seleccionado (consistente con Gallery/Logs)
  if (!robotId) {
    return (
      <main className="main">
        <div className="placeholder-full">
          <XCircle size={48} color="var(--warn)" />
          <h1>Selecciona un Robot</h1>
          <p>Debes seleccionar un robot para acceder a la configuración específica del sistema.</p>
        </div>
      </main>
    );
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // Si tu backend soporta config por robot, descomenta:
        // const data = await api.getConfig(robotId);
        const data = await api.getConfig();
        if (!cancelled && data) {
          setCfg((prev) => deepMerge(prev, data));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, robotId]); // 🔄 si cambia robot, recarga

  const onChange = (path) => (e) => {
    const value = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setCfg((prev) => setAt(prev, path, value));
  };

  const onCorsAdd = () =>
    setCfg((prev) => ({
      ...prev,
      system: { ...prev.system, cors: [...(prev.system.cors || []), ""] },
    }));

  const onCorsEdit = (i, val) =>
    setCfg((prev) => {
      const cors = [...(prev.system.cors || [])];
      cors[i] = val;
      return { ...prev, system: { ...prev.system, cors } };
    });

  const onCorsDel = (i) =>
    setCfg((prev) => {
      const cors = [...(prev.system.cors || [])];
      cors.splice(i, 1);
      return { ...prev, system: { ...prev.system, cors } };
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveConfig(cfg /* , robotId */);
      alert("Configuración guardada.");
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="main">
        <div className="card">Cargando configuración…</div>
      </div>
    );
  }

  return (
    <div className="main" style={{ display: "grid", gap: 16 }}>
      <h2>Configuraciones del sistema y robot: {robotAlias}</h2>
      <form className="card" onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        {/* Marca */}
        <section>
          <h3 style={{ marginTop: 0 }}>Marca</h3>
          <div style={grid2}>
            <LabeledColor label="Primario" value={cfg.brand.primary} onChange={onChange(["brand", "primary"])} />
            <LabeledColor label="Tinta" value={cfg.brand.ink} onChange={onChange(["brand", "ink"])} />
            <LabeledColor label="Acento" value={cfg.brand.accent} onChange={onChange(["brand", "accent"])} />
          </div>
        </section>

        {/* Robot */}
        <section>
          <h3>Robot</h3>
          <div style={grid2}>
            <LabeledInput
              label="Intervalo de stream (ms)"
              type="number"
              value={cfg.robot.streamIntervalMs}
              onChange={onChange(["robot", "streamIntervalMs"])}
            />
            <LabeledCheck
              label="Auto iniciar en encendido"
              checked={!!cfg.robot.autoStart}
              onChange={onChange(["robot", "autoStart"])}
            />
          </div>
        </section>

        {/* Sistema */}
        <section>
          <h3>Sistema</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <LabeledCheck
              label="Habilitar Push Notifications"
              checked={!!cfg.system.enablePush}
              onChange={onChange(["system", "enablePush"])}
            />
            <LabeledInput
              label="VAPID Public Key"
              value={cfg.system.vapidPublicKey || ""}
              onChange={onChange(["system", "vapidPublicKey"])}
              placeholder="(opcional) clave pública para Web Push"
            />
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>CORS permitidos</div>
              <div style={{ display: "grid", gap: 8 }}>
                {(cfg.system.cors || []).map((url, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <input
                      value={url}
                      onChange={(e) => onCorsEdit(i, e.target.value)}
                      placeholder="https://tu-app.vercel.app"
                      style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,.1)" }}
                    />
                    <button type="button" className="btn" onClick={() => onCorsDel(i)}>
                      Eliminar
                    </button>
                  </div>
                ))}
                <button type="button" className="btn" onClick={onCorsAdd}>
                  Agregar origen
                </button>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* Helpers UI */
function LabeledInput({ label, ...rest }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      <input {...rest} style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,.1)" }} />
    </label>
  );
}
function LabeledColor({ label, value, onChange }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      <input type="color" value={value} onChange={onChange} style={{ height: 44, borderRadius: 8, border: "1px solid rgba(0,0,0,.1)" }} />
    </label>
  );
}
function LabeledCheck({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

/* Helpers data */
function setAt(obj, pathArr, value) {
  const copy = structuredClone(obj);
  let cur = copy;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const k = pathArr[i];
    cur[k] = cur[k] ?? {};
    cur = cur[k];
  }
  cur[pathArr[pathArr.length - 1]] =
    typeof value === "string" && !isNaN(value) && value.trim() !== "" ? Number(value) : value;
  return copy;
}
function deepMerge(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) return b ?? a; // arrays: reemplazo
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return b ?? a;
  const out = { ...a };
  for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
  return out;
}
