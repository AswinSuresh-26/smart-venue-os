import { useCrowdData, ZONES } from "../hooks/useCrowdData";

const TYPE_ICONS = {
  gate: "🚪",
  food: "🍔",
  wc: "🚻",
  medic: "🏥",
  merch: "👕",
};

function densityColor(density) {
  if (density < 40) return "#00c896";
  if (density < 70) return "#ffd700";
  return "#ff3b3b";
}

export default function HeatMap({ onZoneSelect, selectedZone }) {
  const { zones } = useCrowdData();

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-header">
        <span className="font-head" style={{ fontSize: 14, color: "var(--accent)" }}>
          LIVE VENUE MAP
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--success)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", display: "inline-block", animation: "pulse 1.5s infinite" }} />
          Live
        </span>
      </div>

      <div className="stadium-map">
        {/* Stadium outline */}
        <svg viewBox="0 0 100 100" className="stadium-svg" xmlns="http://www.w3.org/2000/svg">
          {/* Outer ring */}
          <ellipse cx="50" cy="50" rx="48" ry="47"
            fill="none" stroke="#232836" strokeWidth="0.5" />
          {/* Inner field */}
          <ellipse cx="50" cy="50" rx="28" ry="26"
            fill="#0d3b1f" stroke="#1a5c30" strokeWidth="0.5" />
          {/* Center circle */}
          <circle cx="50" cy="50" r="7"
            fill="none" stroke="#1a5c30" strokeWidth="0.4" />
          {/* Center line */}
          <line x1="50" y1="24" x2="50" y2="76"
            stroke="#1a5c30" strokeWidth="0.4" />

          {/* Crowd density blobs */}
          {zones.map((zone) => (
            <g key={zone.id}>
              <circle
                cx={zone.x}
                cy={zone.y}
                r={zone.density > 70 ? 7 : zone.density > 40 ? 5.5 : 4}
                fill={densityColor(zone.density)}
                opacity={0.18}
              />
              <circle
                cx={zone.x}
                cy={zone.y}
                r={2.5}
                fill={densityColor(zone.density)}
                opacity={0.9}
                style={{ cursor: "pointer" }}
                onClick={() => onZoneSelect && onZoneSelect(zone)}
                className={selectedZone?.id === zone.id ? "selected-zone" : ""}
              />
            </g>
          ))}
        </svg>

        {/* Legend overlays */}
        <div className="map-legend">
          {zones.map((zone) => (
            <button
              key={zone.id}
              className={`zone-pill ${selectedZone?.id === zone.id ? "active" : ""}`}
              style={{ "--z-color": densityColor(zone.density) }}
              onClick={() => onZoneSelect && onZoneSelect(zone)}
            >
              {TYPE_ICONS[zone.type]} {zone.name.split(" ").slice(-1)[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="heatmap-legend-row">
        <span><span className="dot green" /> Low (&lt;40%)</span>
        <span><span className="dot yellow" /> Moderate (40-70%)</span>
        <span><span className="dot red" /> High (&gt;70%)</span>
      </div>
    </div>
  );
}
