import React, { useState, useEffect } from "react";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [analyticsRes, alertsRes] = await Promise.all([
          fetch(`${backendUrl}/api/analytics/crowd-summary`),
          fetch(`${backendUrl}/api/analytics/alerts`)
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }

        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  if (loading) {
    return (
      <div style={{
        padding: "16px",
        textAlign: "center",
        color: "#8b94a8"
      }}>
        📊 Loading analytics from BigQuery...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: "16px",
        color: "#ff3b3b",
        background: "rgba(255, 59, 59, 0.1)",
        borderRadius: "8px",
        border: "1px solid #ff3b3b"
      }}>
        ⚠️ Analytics Error: {error}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Crowd Analytics Summary */}
      {analytics?.analytics && analytics.analytics.length > 0 && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px"
          }}>
            <h3 style={{ margin: 0, color: "var(--accent)" }}>📊 Crowd Analytics (24h)</h3>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              From Google BigQuery
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "12px"
          }}>
            {analytics.analytics.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--surface2)",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)"
                }}
              >
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {item.zone_name}
                </div>
                <div style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "8px",
                  fontSize: "13px"
                }}>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Avg:</span>
                    <span style={{ color: "#ffd700", marginLeft: "4px", fontWeight: 600 }}>
                      {item.avg_density}%
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Peak:</span>
                    <span style={{
                      color: item.peak_density > 80 ? "#ff3b3b" : "#00c896",
                      marginLeft: "4px",
                      fontWeight: 600
                    }}>
                      {item.peak_density}%
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Events:</span>
                    <span style={{ color: "var(--accent)", marginLeft: "4px", fontWeight: 600 }}>
                      {item.events}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: "11px",
            color: "var(--muted)",
            textAlign: "right"
          }}>
            Total events logged: {analytics.total_events}
          </div>
        </div>
      )}

      {/* Alerts History */}
      {alerts?.alerts && alerts.alerts.length > 0 && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px"
          }}>
            <h3 style={{ margin: 0, color: "#ff3b3b" }}>🚨 High-Density Alerts (24h)</h3>
            <span style={{
              background: "#ff3b3b",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600
            }}>
              {alerts.total_alerts} alerts
            </span>
          </div>

          <div style={{
            maxHeight: "300px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            {alerts.alerts.slice(0, 10).map((alert, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 59, 59, 0.1)",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ff3b3b",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px"
                }}
              >
                <div>
                  <span style={{ color: "#ff3b3b", fontWeight: 600 }}>
                    {alert.zone_name}
                  </span>
                  <span style={{ color: "var(--muted)", marginLeft: "8px" }}>
                    {alert.density}% density
                  </span>
                </div>
                <span style={{ color: "var(--muted)", fontSize: "10px" }}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {(!analytics?.analytics || analytics.analytics.length === 0) && (!alerts?.alerts || alerts.alerts.length === 0) && (
        <div style={{
          background: "var(--surface)",
          padding: "24px",
          textAlign: "center",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          color: "var(--muted)"
        }}>
          <p>📊 No analytics data yet</p>
          <p style={{ fontSize: "12px" }}>
            BigQuery will collect crowd data as the system runs. Check back in a few minutes!
          </p>
        </div>
      )}
    </div>
  );
}
