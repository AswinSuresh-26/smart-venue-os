import { useState } from "react";
import AttendeeView from "./pages/AttendeeView";
import AdminView from "./pages/AdminView";
import "./index.css";

export default function App() {
  const [mode, setMode] = useState("attendee");

  return (
    <div className="app">
      <nav className="top-nav">
        <div className="nav-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">SVOS</span>
          <span className="brand-sub">Smart Venue OS</span>
        </div>
        <div className="nav-toggle">
          <button
            className={mode === "attendee" ? "active" : ""}
            onClick={() => setMode("attendee")}
          >
            Attendee
          </button>
          <button
            className={mode === "admin" ? "active" : ""}
            onClick={() => setMode("admin")}
          >
            Admin
          </button>
        </div>
      </nav>
      {mode === "attendee" ? <AttendeeView /> : <AdminView />}
    </div>
  );
}
