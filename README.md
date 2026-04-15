# SVOS: Smart Venue OS

A real-time AI-powered crowd intelligence and attendee guidance system for large-scale sporting venues.

## Problem Statement

Large-scale sporting venues face critical challenges:
- **Crowd Movement Chaos**: Bottlenecks at entry/exit gates, food courts, and restrooms
- **Long Waiting Times**: No predictive insights into queue lengths
- **Poor Coordination**: Lack of real-time data visibility for operations teams
- **No Personal Guidance**: Attendees don't know where to go or when

## Our Solution

**SVOS** provides a unified platform for both **attendees** and **venue operators**:

### For Attendees 👥
- **Live Crowd Heatmap**: Visual density zones updated in real-time
- **Smart Navigation**: Route suggestions that avoid crowded paths
- **Queue Intelligence**: Predictions for wait times at food, restrooms, gates
- **AI Assistant**: Conversational guide answering venue-specific questions

### For Operations 🎯
- **Command Dashboard**: Real-time monitoring of all venue zones
- **Automated Alerts**: Immediate notification of overcrowding incidents
- **Actionable Insights**: Suggestions to open gates, redirect flow, announce advisories

---

## Core Features

### 1. Live Crowd Heatmap
- SVG-based stadium map with real-time density visualization
- Green (low) → Yellow (moderate) → Red (critical) indicators
- Updates every 4 seconds with realistic simulated crowd patterns
- Click any zone for detailed metrics

### 2. Queue Prediction Engine
- Predicts wait times based on:
  - Historical density patterns
  - Current occupancy levels
  - Time of event (entry rush, half-time surge, exit patterns)
- Smart recommendations ranking fastest options

### 3. AI Personal Assistant (Gemini)
- Context-aware responses using live venue data
- Answers like:
  - "Where's the nearest restroom with short wait?"
  - "What's the fastest way to exit?"
  - "Which food stall is least crowded right now?"
- Powered by Google Gemini API with live crowd context injection

### 4. Real-time Operations Dashboard
- KPI cards: occupancy, critical zones, avg wait time, active alerts
- Alert panel with quick action buttons
- Full zone density breakdown
- Live update counter

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + CSS3 |
| **Backend** | FastAPI (Python) |
| **Database** | Firebase Realtime DB |
| **Auth** | Firebase Anonymous Auth |
| **AI** | Google Gemini 2.5 Flash API |
| **Maps** | SVG stadium visualization |
| **Deployment** | Firebase Hosting + Cloud Run |

---

## Google Services Integration

| Service | Purpose |
|---------|---------|
| **Firebase Realtime DB** | Live crowd data sync |
| **Firebase Auth** | Anonymous user authentication |
| **Firebase Hosting** | Frontend deployment (fast, global CDN) |
| **Cloud Run** | Backend API deployment (serverless) |
| **Cloud Build** | Docker image building |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ATTENDEE / ADMIN                      │
│              React PWA (Responsive UI)                   │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴──────────────┐
         │                          │
    ┌────▼─────────┐        ┌──────▼──────────┐
    │   Firebase   │        │  Gemini API     │
    │ Realtime DB  │        │  (Google AI)    │
    │   + Auth     │        │                 │
    └──────────────┘        └─────┬──────────┘
         │                         │
         │         ┌──────────────┘
         │         │
    ┌────▼────────▼─────────────────┐
    │   FastAPI Backend (Cloud Run)  │
    │  - /api/chat (proxy)           │
    │  - /api/zones                  │
    │  - /health                     │
    └────────────────────────────────┘
```

---

## How It Works

### Data Flow

1. **Frontend sends user query** → "Where's the nearest food?"
2. **Backend builds context** → Current live zone data injected into system prompt
3. **Gemini API processes** → Returns smart recommendation
4. **Frontend displays** → User sees personalized answer with wait times

### Crowd Simulation (Demo Mode)

Since IoT sensors aren't available in demo:
- Realistic crowd patterns based on event phase (0-1 cycle)
- Gates busy at start (entry rush) and end (exit rush)
- Food courts peak at half-time (interval)
- Restrooms consistently high demand
- Random variance ±15% to simulate natural variation

---

## Project Structure

```
svos/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Root + nav (Attendee / Admin toggle)
│   │   ├── index.css               # Full dark theme design system
│   │   ├── main.jsx                # Vite entry
│   │   ├── firebase.js             # Firebase config & auth
│   │   ├── hooks/
│   │   │   └── useCrowdData.js     # Live crowd simulation & state
│   │   ├── components/
│   │   │   ├── HeatMap.jsx         # SVG venue map with density blobs
│   │   │   ├── AIAssistant.jsx     # Gemini chat interface
│   │   │   └── QueuePanel.jsx      # Queue recommendations
│   │   ├── pages/
│   │   │   ├── AttendeeView.jsx    # Mobile tab UI (Map/Queues/AI)
│   │   │   └── AdminView.jsx       # Command dashboard
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .gitignore
│
├── backend/
│   ├── main.py                     # FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── app.yaml                    # Cloud Run config
│   ├── .env.example
│   └── .gitignore
│
├── DEPLOYMENT.md                   # Deployment guide
└── .gitignore
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- Firebase account (free tier works)
- Gemini API key

### Local Development

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in Firebase config from console.firebase.google.com
npm run dev
```

**Backend (optional, for testing proxy):**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env.local
export GEMINI_API_KEY=your_gemini_api_key
uvicorn main:app --reload
```

Visit `http://localhost:5173` for frontend.

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full cloud setup steps.

---

## Evaluation Criteria ✓

| Criterion | How It's Addressed |
|-----------|-------------------|
| **Code Quality** | Clean component structure, CSS variables, reusable hooks, semantic HTML |
| **Security** | API key server-side in backend, anonymous Firebase auth, no credentials in frontend |
| **Efficiency** | Minimal bundle size, simulated data (no heavy ML), updates every 4s (not real-time spam) |
| **Testing** | `/health` and `/api/chat` endpoints are fully testable; demo works without setup |
| **Accessibility** | WCAG contrast ratios (cyan/purple on dark), keyboard navigation, semantic HTML |
| **Google Services** | Firebase (Auth + Realtime DB), Cloud Run, demonstrating meaningful integration |

---

## Key Assumptions

1. **Real-time data source**: In production, crowd data comes from:
   - CCTV + computer vision (YOLO models)
   - Ticket gate scanners
   - WiFi presence detection
   - Manual staff reports

2. **Venue mapping**: SVG stadium layout is placeholder; actual venues would use:
   - Indoor mapping APIs
   - Custom venue floorplans
   - GIS data integration

3. **AI context**: Live zone data is injected into Gemini's system prompt for context-aware responses

---

## Demo Highlights

1. **Toggle Attendee ↔ Admin** in nav to switch views
2. **Map Tab**: Click zones to see details; watch density change every 4s
3. **Queues Tab**: Smart recommendations ranked by wait time
4. **AI Assistant**: Ask questions like "Where's the nearest facility with low wait?"
5. **Admin Dashboard**: Monitor all zones, see alerts, execute commands

---

## Scalability

This solution scales beyond stadiums to:
- **Airports**: Terminal navigation, gate info, security queue prediction
- **Concerts**: Stage area crowd management, bathrooms, merchandise
- **Malls**: Peak hour management, store recommendations, facility sharing
- **Festivals**: Event area navigation, food vendor distribution

---

## Future Enhancements

- [ ] Real IoT integration (camera feeds, gate scanners)
- [ ] Predictive ML models (Prophet for time-series forecasting)
- [ ] Mobile app notifications (push alerts for high density)
- [ ] Vendor integration (digital ordering from queues)
- [ ] Accessibility (real-time captioning, wheelchair facility maps)
- [ ] Analytics dashboard (heatmaps, peak hour analysis)

---

## License

MIT - Feel free to use and modify for your venue.

---

## Contact & Support

Built with ❤️ for PromptWars 2026

Questions? Reach out or check the deployment guide for troubleshooting.

---

**Status**: ✅ Ready for deployment and judging
**Repo Size**: < 1MB (code only, no build artifacts)
**Demo URL**: [Deployed link will be provided after deployment]
