import { useCrowdData } from "../hooks/useCrowdData";

const TYPE_ICONS = { gate: "🚪", food: "🍔", wc: "🚻", medic: "🏥", merch: "👕" };

function WaitBar({ value }) {
  const color = value > 70 ? "var(--red)" : value > 40 ? "#ffd700" : "var(--success)";
  return (
    <div style={{ background: "var(--surface2)", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div
        style={{
          width: `${value}%`, height: "100%",
          background: color,
          borderRadius: 4,
          transition: "width 0.8s ease",
          boxShadow: `0 0 8px ${color}55`,
        }}
      />
    </div>
  );
}

export default function QueuePanel({ onZoneSelect }) {
  const { zones, getDensityLabel, recommendations } = useCrowdData();

  const byType = {
    gate: zones.filter((z) => z.type === "gate"),
    food: zones.filter((z) => z.type === "food"),
    wc: zones.filter((z) => z.type === "wc"),
  };

  return (
    <div className="queue-panel">
      {/* Recommendations */}
      <div className="card mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: 16 }}>⚡</span>
          <span className="font-head" style={{ fontSize: 13, color: "var(--accent)" }}>
            SMART RECOMMENDATIONS
          </span>
        </div>
        {recommendations.map((z, i) => (
          <div key={z.id} className="rec-item" onClick={() => onZoneSelect(z)}>
            <div className="rec-rank">#{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {TYPE_ICONS[z.type]} {z.name}
              </div>
              <div className="text-xs text-muted">
                Only {z.waitTime} min wait · {z.density}% capacity
              </div>
            </div>
            <span className="badge green">Best</span>
          </div>
        ))}
      </div>

      {/* All zones by category */}
      {Object.entries(byType).map(([type, zlist]) => (
        <div key={type} className="card mb-3">
          <div className="font-head text-xs text-muted mb-3" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
            {TYPE_ICONS[type]} {type === "wc" ? "Restrooms" : type === "gate" ? "Entry / Exit Gates" : "Food Courts"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {zlist.map((zone) => {
              const { label, color } = getDensityLabel(zone.density);
              return (
                <div key={zone.id} className="zone-row" onClick={() => onZoneSelect(zone)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      {zone.name}
                    </div>
                    <WaitBar value={zone.density} />
                  </div>
                  <div style={{ textAlign: "right", minWidth: 80 }}>
                    <span className={`badge ${color}`}>{label}</span>
                    <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                      {zone.waitTime > 0 ? `~${zone.waitTime} min` : "No wait"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
