import React, { useCallback, useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useCrowdData, ZONES } from "../hooks/useCrowdData";

const TYPE_ICONS = {
  gate: "🚪",
  food: "🍔",
  wc: "🚻",
  medic: "🏥",
  merch: "👕",
};

const TYPE_COLORS = {
  gate: { primary: "#FF6B6B", accent: "#FFB3B3" },
  food: { primary: "#FFA500", accent: "#FFD700" },
  wc: { primary: "#4ECDC4", accent: "#7FF0E8" },
  medic: { primary: "#00C896", accent: "#33FF99" },
  merch: { primary: "#7B61FF", accent: "#9F8BFF" },
};

function densityColor(density) {
  if (density < 40) return "#00c896"; // green
  if (density < 70) return "#ffd700"; // yellow
  return "#ff3b3b"; // red
}

function getPulseSize(density) {
  // Marker size increases with density
  if (density < 40) return 32;
  if (density < 70) return 40;
  return 48;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

const mapOptions = {
  zoom: 14,
  disableDefaultUI: false,
  styles: [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#0a0c10" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#0a0c10" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#e8eaf0" }]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#6b7280" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#6b7280" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{ "color": "#1a1f2b" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#232836" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#8b94a8" }]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [{ "color": "#1a1f2b" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#0d3b4a" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#4a7580" }]
    }
  ]
};

// Default venue center (San Francisco as placeholder - will be configurable)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

export default function GoogleMapsVenue({ onZoneSelect, selectedZone }) {
  const { zones } = useCrowdData();
  const [infoWindowZone, setInfoWindowZone] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Show helpful message if API key is missing
  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <div className="heatmap-wrap" style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        minHeight: "400px",
        background: "linear-gradient(135deg, #12151c 0%, #1a1f2b 100%)",
        borderRadius: "12px",
        border: "1px solid var(--border)",
        color: "#e8eaf0"
      }}>
        <div style={{ 
          textAlign: "center",
          padding: "40px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
          <h3 style={{ margin: "0 0 12px 0", color: "var(--accent)" }}>Google Maps Integration</h3>
          <p style={{ fontSize: "14px", color: "#8b94a8", marginBottom: "24px", maxWidth: "300px" }}>
            Google Maps API key not configured. Add it to <code style={{ background: "var(--surface2)", padding: "2px 6px", borderRadius: "4px" }}>frontend/.env.local</code>
          </p>
          <div style={{ 
            background: "var(--surface2)", 
            padding: "16px", 
            borderRadius: "8px",
            border: "1px solid var(--border)",
            fontSize: "12px",
            fontFamily: "monospace",
            textAlign: "left",
            color: "#7b61ff"
          }}>
            VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "16px" }}>
            Switch to "🎨 Fast SVG Map" to continue using the venue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-header">
        <span className="font-head" style={{ fontSize: 14, color: "var(--accent)" }}>
          📍 LIVE VENUE MAP (Google Maps)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--success)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", display: "inline-block", animation: "pulse 1.5s infinite" }} />
          Live
        </span>
      </div>

      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={mapOptions.zoom}
          options={mapOptions}
        >
          {zones.map((zone) => {
            const markerSize = getPulseSize(zone.density);
            const color = densityColor(zone.density);

            const svgMarker = {
              path: `M0,-${markerSize / 2}c${markerSize / 2},0 ${markerSize},${markerSize / 2} ${markerSize},${markerSize}c0,${markerSize} -${markerSize / 2},${markerSize * 1.5} -${markerSize},${markerSize * 1.5}c-${markerSize / 2},-${markerSize * 1.5} -${markerSize},-${markerSize} -${markerSize},-${markerSize}c0,-${markerSize / 2} ${markerSize / 2},0 0,-${markerSize / 2}z`,
              fillColor: color,
              fillOpacity: 0.8,
              strokeColor: "#fff",
              strokeWeight: 2,
              anchor: { x: markerSize / 2, y: markerSize },
              scale: 0.6,
            };

            return (
              <Marker
                key={zone.id}
                position={{
                  lat: 37.7749 + (zone.y - 50) * 0.01,
                  lng: -122.4194 + (zone.x - 50) * 0.01,
                }}
                icon={svgMarker}
                onClick={() => {
                  setInfoWindowZone(zone);
                  onZoneSelect && onZoneSelect(zone);
                }}
              />
            );
          })}

          {infoWindowZone && (
            <InfoWindow
              position={{
                lat: 37.7749 + (infoWindowZone.y - 50) * 0.01,
                lng: -122.4194 + (infoWindowZone.x - 50) * 0.01,
              }}
              onCloseClick={() => setInfoWindowZone(null)}
            >
              <div style={{
                background: "#12151c",
                color: "#e8eaf0",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #232836",
                minWidth: "200px",
              }}>
                <h3 style={{ margin: "0 0 8px 0", color: "var(--accent)" }}>
                  {TYPE_ICONS[infoWindowZone.type]} {infoWindowZone.name}
                </h3>
                <div style={{ fontSize: "12px", color: "#8b94a8", lineHeight: "1.6" }}>
                  <div>
                    <strong>Density:</strong> {infoWindowZone.density}%
                    <span style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      marginLeft: "6px",
                      borderRadius: "50%",
                      background: densityColor(infoWindowZone.density)
                    }} />
                  </div>
                  <div style={{ color: infoWindowZone.density > 70 ? "#ff3b3b" : infoWindowZone.density > 40 ? "#ffd700" : "#00c896" }}>
                    <strong>Status:</strong> {infoWindowZone.density < 40 ? "Low" : infoWindowZone.density < 70 ? "Moderate" : "High"}
                  </div>
                  {infoWindowZone.waitTime > 0 && (
                    <div>
                      <strong>Est. Wait:</strong> {infoWindowZone.waitTime} min
                    </div>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Legend overlays */}
      <div className="map-legend" style={{ marginTop: "12px" }}>
        {zones.map((zone) => (
          <button
            key={zone.id}
            className={`zone-pill ${selectedZone?.id === zone.id ? "active" : ""}`}
            style={{ "--z-color": densityColor(zone.density) }}
            onClick={() => {
              onZoneSelect && onZoneSelect(zone);
              setInfoWindowZone(zone);
            }}
          >
            {TYPE_ICONS[zone.type]} {zone.name.split(" ").slice(-1)[0]}
          </button>
        ))}
      </div>

      <div className="heatmap-legend-row">
        <span><span className="dot green" /> Low (&lt;40%)</span>
        <span><span className="dot yellow" /> Moderate (40-70%)</span>
        <span><span className="dot red" /> High (&gt;70%)</span>
      </div>
    </div>
  );
}
