import "./App.css";
import useAdminWS from "./hooks/useAdminWS";
import Sidebar from "./components/Sidebar";
import StatusBar from "./components/StatusBar";
import KpiCard from "./components/KpiCard";
import SnapshotCard from "./components/SnapshotCard";
import TasksTable from "./components/TasksTable";
import SimpleLineChart from "./components/SimpleLineChart";

export default function App() {
  const { connected, latencyMs, telemetry, snapshot, steps, series } = useAdminWS();

  const speed = telemetry?.v ?? null;        // m/s si lo envían (sino será null)
  const dist  = telemetry?.dist ?? null;     // m si lo envían (sino null)

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <header className="header">
          <div className="robsel">
            <input className="input" defaultValue="Robot A" />
          </div>
          <StatusBar latencyMs={latencyMs} telemetry={telemetry} connected={connected}/>
        </header>

        <section className="grid kpis">
          <KpiCard label="Estado"   value={telemetry?.battery} unit="%" />
          <KpiCard label="Velocidad" value={speed} unit="m/s" />
          <KpiCard label="Distancia" value={dist} unit="m" />
        </section>

        <section className="grid mid">
          <SnapshotCard snapshot={snapshot}/>
          <TasksTable items={steps}/>
        </section>

        <section className="grid bottom">
          <SimpleLineChart data={series}/>
          <div className="card">
            <div className="card-title">Notas</div>
            <p className="muted">Acá podés agregar otra tarjeta (logs, usuarios, filtros, etc.).</p>
          </div>
        </section>
      </main>
    </div>
  );
}
