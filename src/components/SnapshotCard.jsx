export default function SnapshotCard({ snapshot }) {
  return (
    <div className="card">
      <div className="card-title">Instantánea</div>
      <div className="snapshot-box">
        {snapshot?.url
          ? <img src={snapshot.url} alt={snapshot?.description || "snapshot"} />
          : <div className="placeholder">Sin imagen</div>}
      </div>
      <div className="muted">{snapshot?.description || "—"}</div>
    </div>
  );
}
