export default function TasksTable({ items = [] }) {
  return (
    <div className="card">
      <div className="card-title">Tareas</div>
      <div className="table">
        <div className="tr th">
          <div>ID</div><div>Descripción</div><div>Estado</div>
        </div>
        {items.length === 0 ? (
          <div className="muted" style={{padding:8}}>Sin datos</div>
        ) : items.map((t, i) => (
          <div className="tr" key={t.id || i}>
            <div>{t.id || i+1}</div>
            <div>{t.text || t.desc || "—"}</div>
            <div>{t.done ? "Completa" : "Activa"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
