import { useCrowdData, ZONES } from "../hooks/useCrowdData";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import "./AdminView.css";

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function ZoneRow({ zone }) {
  const fill = zone.density > 70 ? "#ff3b3b" : zone.density > 40 ? "#ffd700" : "#00c896";
  return (
    <div className="admin-zone-row">
      <div style={{ width: 100, fontSize: 12, fontWeight: 500 }}>{zone.name.split("(")[0].trim()}</div>
      <div style={{ flex: 1 }}>
        <div style={{ height: 8, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            width: `${zone.density}%`, height: "100%", background: fill,
            borderRadius: 4, transition: "width 0.8s ease",
            boxShadow: `0 0 8px ${fill}55`
          }} />
        </div>
      </div>
      <div style={{ width: 38, textAlign: "right", fontSize: 12, fontWeight: 600, color: fill }}>
        {zone.density}%
      </div>
      <div style={{ width: 60, textAlign: "right", fontSize: 11, color: "var(--muted)" }}>
        {zone.waitTime > 0 ? `${zone.waitTime}m` : "–"}
      </div>
      {zone.alert && (
        <span className="badge red" style={{ fontSize: 10 }}>ALERT</span>
      )}
    </div>
  );
}

export default function AdminView() {
  const { zones, alerts, tick } = useCrowdData();

  const totalOccupancy = Math.round(zones.reduce((s, z) => s + z.density, 0) / zones.length);
  const criticalCount = zones.filter((z) => z.density > 80).length;
  const avgWait = Math.round(zones.filter((z) => z.waitTime > 0).reduce((s, z) => s + z.waitTime, 0) / zones.filter((z) => z.waitTime > 0).length);

  return (
    <div className="admin-view">
      <div className="admin-header">
        <div>
          <div className="font-head" style={{ fontSize: 18, color: "var(--accent)" }}>Command Center</div>
          <div className="text-xs text-muted">SVOS Arena · Live Operations Dashboard</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", display: "inline-block", animation: "pulse 1s infinite" }} />
          <span className="text-xs" style={{ color: "var(--success)" }}>Live · Update #{tick}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <StatCard label="Avg Occupancy" value={`${totalOccupancy}%`} color="var(--accent)" />
        <StatCard label="Critical Zones" value={criticalCount} sub="above 80%" color={criticalCount > 0 ? "var(--red)" : "var(--success)"} />
        <StatCard label="Avg Wait" value={`${avgWait}m`} color="var(--warn)" />
        <StatCard label="Active Alerts" value={alerts.length} color={alerts.length > 0 ? "var(--red)" : "var(--success)"} />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="alerts-section card mb-3">
          <div className="font-head text-xs mb-3" style={{ color: "var(--red)", letterSpacing: 1 }}>
            🚨 ACTIVE ALERTS
          </div>
          {alerts.map((a) => (
            <div key={a.id} className="alert-item">
              <span>⚠️ <strong>{a.name}</strong> — {a.density}% capacity · {a.waitTime} min wait</span>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button className="action-btn">Open Gate</button>
                <button className="action-btn">Redirect Flow</button>
                <button className="action-btn warn">Announce</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics from BigQuery */}
      <div className="card mb-3">
        <AnalyticsDashboard />
      </div>

      {/* All zones */}
      <div className="card">
        <div className="font-head text-xs text-muted mb-3" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
          All Zones · Real-time Density
        </div>
        <div className="admin-zone-header">
          <div style={{ width: 100, fontSize: 11, color: "var(--muted)" }}>Zone</div>
          <div style={{ flex: 1, fontSize: 11, color: "var(--muted)" }}>Density</div>
          <div style={{ width: 38, fontSize: 11, color: "var(--muted)", textAlign: "right" }}>%</div>
          <div style={{ width: 60, fontSize: 11, color: "var(--muted)", textAlign: "right" }}>Wait</div>
          <div style={{ width: 50 }}></div>
        </div>
        {zones.map((z) => <ZoneRow key={z.id} zone={z} />)}
      </div>
    </div>
  );
}
