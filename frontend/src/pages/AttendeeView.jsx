import { useState } from "react";
import HeatMap from "../components/HeatMap";
import GoogleMapsVenue from "../components/GoogleMapsVenue";
import QueuePanel from "../components/QueuePanel";
import AIAssistant from "../components/AIAssistant";
import { useCrowdData } from "../hooks/useCrowdData";
import "./AttendeeView.css";

const TABS = ["Map", "Queues", "Assistant"];
const TAB_ICONS = ["🗺️", "⏱️", "🤖"];

export default function AttendeeView() {
  const [tab, setTab] = useState(0);
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapView, setMapView] = useState("svg"); // "svg" or "gmaps"
  const { alerts } = useCrowdData();

  return (
    <div className="attendee-view">
      {/* Alert banner */}
      {alerts.length > 0 && (
        <div className="alert-banner">
          🚨 High density detected at: {alerts.map((a) => a.name).join(", ")} — consider alternate routes
        </div>
      )}

      {/* Zone detail card */}
      {selectedZone && (
        <div className="zone-detail-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="font-head" style={{ fontSize: 16 }}>{selectedZone.name}</div>
              <div className="text-muted text-sm">
                {selectedZone.density}% capacity · {selectedZone.waitTime > 0 ? `~${selectedZone.waitTime} min wait` : "No wait"}
              </div>
            </div>
            <button onClick={() => setSelectedZone(null)}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18 }}>
              ✕
            </button>
          </div>
          <div style={{ marginTop: 10 }}>
            <span className={`badge ${selectedZone.density > 70 ? "red" : selectedZone.density > 40 ? "warn" : "green"}`}>
              {selectedZone.density > 70 ? "⚠️ Crowded" : selectedZone.density > 40 ? "Moderate" : "✅ Clear"}
            </span>
            {selectedZone.alert && (
              <span className="badge red" style={{ marginLeft: 6 }}>🚨 Alert Active</span>
            )}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="tab-bar">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`tab-btn ${tab === i ? "active" : ""}`}
            onClick={() => setTab(i)}
          >
            <span>{TAB_ICONS[i]}</span>
            <span>{t}</span>
            {t === "Queues" && alerts.length > 0 && (
              <span className="tab-badge">{alerts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Map view toggle (show only when Map tab is active) */}
      {tab === 0 && (
        <div style={{
          display: "flex",
          gap: "8px",
          padding: "12px 0",
          borderBottom: "1px solid var(--border)",
          marginBottom: "12px"
        }}>
          <button
            onClick={() => setMapView("svg")}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: mapView === "svg" ? "var(--accent)" : "var(--surface2)",
              color: mapView === "svg" ? "#fff" : "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            🎨 Fast SVG Map
          </button>
          <button
            onClick={() => setMapView("gmaps")}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: mapView === "gmaps" ? "var(--accent)" : "var(--surface2)",
              color: mapView === "gmaps" ? "#fff" : "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            🗺️ Google Maps
          </button>
        </div>
      )}

      {/* Content */}
      <div className="tab-content">
        {tab === 0 && mapView === "svg" && <HeatMap onZoneSelect={setSelectedZone} selectedZone={selectedZone} />}
        {tab === 0 && mapView === "gmaps" && <GoogleMapsVenue onZoneSelect={setSelectedZone} selectedZone={selectedZone} />}
        {tab === 1 && <QueuePanel onZoneSelect={(z) => { setSelectedZone(z); setTab(0); }} />}
        {tab === 2 && <AIAssistant />}
      </div>
    </div>
  );
}
