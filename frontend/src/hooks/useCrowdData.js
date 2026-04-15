import { useState, useEffect, useRef } from "react";

// Simulated venue zones - realistic stadium layout
export const ZONES = [
  { id: "gate-a", name: "Gate A (Main)", type: "gate", x: 50, y: 5 },
  { id: "gate-b", name: "Gate B (East)", type: "gate", x: 90, y: 45 },
  { id: "gate-c", name: "Gate C (West)", type: "gate", x: 10, y: 45 },
  { id: "gate-d", name: "Gate D (South)", type: "gate", x: 50, y: 90 },
  { id: "food-1", name: "Food Court North", type: "food", x: 30, y: 20 },
  { id: "food-2", name: "Food Court East", type: "food", x: 75, y: 35 },
  { id: "food-3", name: "Food Court South", type: "food", x: 65, y: 75 },
  { id: "wc-1", name: "Restrooms North", type: "wc", x: 55, y: 18 },
  { id: "wc-2", name: "Restrooms West", type: "wc", x: 18, y: 60 },
  { id: "wc-3", name: "Restrooms East", type: "wc", x: 82, y: 60 },
  { id: "medic", name: "Medical Center", type: "medic", x: 50, y: 50 },
  { id: "merch", name: "Merchandise", type: "merch", x: 25, y: 75 },
];

function randomDensity(base, variance) {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance));
}

function generateCrowdData(tick) {
  // Simulate realistic crowd patterns based on event time
  const matchPhase = (tick % 120) / 120; // 0-1 cycle simulating event phases

  return ZONES.map((zone) => {
    let baseDensity = 30;
    let waitTime = 2;

    if (zone.type === "gate") {
      // Gates busy at start and end
      baseDensity = matchPhase < 0.2 || matchPhase > 0.85 ? 80 : 20;
      waitTime = Math.round(baseDensity / 10);
    } else if (zone.type === "food") {
      // Food courts busy at half-time
      baseDensity = matchPhase > 0.4 && matchPhase < 0.6 ? 85 : 35;
      waitTime = Math.round(baseDensity / 8);
    } else if (zone.type === "wc") {
      baseDensity = matchPhase > 0.38 && matchPhase < 0.55 ? 90 : 40;
      waitTime = Math.round(baseDensity / 15);
    } else if (zone.type === "merch") {
      baseDensity = 45;
      waitTime = 3;
    } else {
      baseDensity = 15;
      waitTime = 0;
    }

    const density = randomDensity(baseDensity, 15);
    return {
      ...zone,
      density: Math.round(density),
      waitTime: Math.max(0, waitTime + Math.round((Math.random() - 0.5) * 3)),
      alert: density > 80,
    };
  });
}

export function useCrowdData() {
  const [zones, setZones] = useState(() => generateCrowdData(0));
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);
      setZones(generateCrowdData(tickRef.current));
    }, 4000); // update every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const getDensityLabel = (d) => {
    if (d < 40) return { label: "Low", color: "green" };
    if (d < 70) return { label: "Moderate", color: "yellow" };
    return { label: "High", color: "red" };
  };

  const alerts = zones.filter((z) => z.alert);
  const recommendations = zones
    .filter((z) => z.type === "food" || z.type === "wc")
    .sort((a, b) => a.density - b.density)
    .slice(0, 3);

  return { zones, tick, getDensityLabel, alerts, recommendations };
}
