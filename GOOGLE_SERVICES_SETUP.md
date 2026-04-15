# Google Services Integration Guide

This guide explains how to configure and deploy all three Google Services integrated into SVOS:

1. **Google Maps SDK** - Real-time venue mapping
2. **Cloud Pub/Sub** - Real-time crowd data streaming
3. **Cloud BigQuery** - Analytics & historical tracking

---

## Part 1: Google Maps SDK (Frontend)

### Setup Steps

1. **Get Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing: `diesel-command-493401-q7`
   - Enable **Maps JavaScript API**:
     - Navigate to APIs & Services → Library
     - Search for "Maps JavaScript API"
     - Click Enable

2. **Get Your API Key**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → API Key
   - Restrict the key to:
     - Application type: **Website**
     - Website restrictions: Add your domain (e.g., `localhost:5173` for dev, your domain for prod)
   - **Copy the API Key**

3. **Add to Frontend Environment**
   ```bash
   # frontend/.env.local
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```

4. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Testing
- Frontend component: [GoogleMapsVenue.jsx](../src/components/GoogleMapsVenue.jsx)
- Should display live venue map with crowd density markers
- Zoom to see venue details, click markers for info windows

---

## Part 2: Cloud Pub/Sub (Backend Real-time Streaming)

### Setup Steps

1. **Enable Pub/Sub API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - APIs & Services → Library
   - Search for "Pub/Sub"
   - Click Enable

2. **Create Pub/Sub Topic**
   ```bash
   gcloud pubsub topics create crowd-data --project=diesel-command-493401-q7
   ```

3. **Create Subscription (for frontend/subscribers)**
   ```bash
   gcloud pubsub subscriptions create crowd-data-sub \
     --topic=crowd-data \
     --ack-deadline=60 \
     --project=diesel-command-493401-q7
   ```

4. **Set Environment Variables (Backend)**
   ```bash
   # backend/.env
   GCP_PROJECT_ID=diesel-command-493401-q7
   PUBSUB_CROWD_TOPIC=crowd-data
   ```

5. **Authenticate Backend**
   - Create a Service Account with Pub/Sub Editor role:
     ```bash
     gcloud iam service-accounts create svos-backend --project=diesel-command-493401-q7
     
     gcloud projects add-iam-policy-binding diesel-command-493401-q7 \
       --member=serviceAccount:svos-backend@diesel-command-493401-q7.iam.gserviceaccount.com \
       --role=roles/pubsub.editor
     ```
   - Create and download JSON key:
     ```bash
     gcloud iam service-accounts keys create backend-key.json \
       --iam-account=svos-backend@diesel-command-493401-q7.iam.gserviceaccount.com
     ```
   - Set authentication:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS=/path/to/backend-key.json
     ```

### API Endpoints
- **Health Check with Services**: `GET /health`
- **Pub/Sub Info**: `GET /api/pubsub/topic-info`
- **Zone Data** (publishes to Pub/Sub): `GET /api/zones`

### Testing
```bash
cd backend
pip install -r requirements.txt
export GOOGLE_APPLICATION_CREDENTIALS=./backend-key.json
uvicorn main:app --reload
```

Check `GET http://localhost:8000/health` for service status.

---

## Part 3: Cloud BigQuery (Backend Analytics)

### Setup Steps

1. **Enable BigQuery API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - APIs & Services → Library
   - Search for "BigQuery API"
   - Click Enable

2. **Create BigQuery Dataset**
   ```bash
   bq mk --dataset \
     --location=US \
     --description="SVOS Analytics Dataset" \
     diesel-command-493401-q7:svos_analytics
   ```

3. **Set Environment Variables (Backend)**
   ```bash
   # backend/.env
   BIGQUERY_DATASET=svos_analytics
   BIGQUERY_TABLE=crowd_events
   ```

4. **Service Account Permissions**
   - Add BigQuery Editor role to `svos-backend` service account:
     ```bash
     gcloud projects add-iam-policy-binding diesel-command-493401-q7 \
       --member=serviceAccount:svos-backend@diesel-command-493401-q7.iam.gserviceaccount.com \
       --role=roles/bigquery.admin
     ```

### How It Works
- Every crowd data event is logged to BigQuery
- Table is auto-created with these columns:
  - `id` (STRING): Zone ID
  - `name` (STRING): Zone name
  - `type` (STRING): Zone type (gate, food, etc.)
  - `density` (INTEGER): Crowd density percentage
  - `wait_time` (INTEGER): Wait time in minutes
  - `alert` (BOOLEAN): High-density alert flag
  - `timestamp` (TIMESTAMP): Event time
  - `x`, `y` (FLOAT): Venue coordinates

### API Endpoints
- **Crowd Analytics**: `GET /api/analytics/crowd-summary`
  - Returns: Average/peak density, event counts by zone
- **Alert History**: `GET /api/analytics/alerts`
  - Returns: High-density alert events (>80% density)

### Querying BigQuery Directly
```bash
# Query last 24 hours of crowd data
bq query --use_legacy_sql=false '
SELECT
  zone_name,
  ROUND(AVG(density), 1) as avg_density,
  MAX(density) as peak_density,
  COUNT(*) as events
FROM `diesel-command-493401-q7.svos_analytics.crowd_events`
WHERE TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), timestamp, HOUR) <= 24
GROUP BY zone_name
ORDER BY peak_density DESC
'
```

---

## Deployment Checklist

### Local Development
- [ ] Google Maps API Key added to `.env.local`
- [ ] Backend `.env` has GCP_PROJECT_ID set
- [ ] Service account JSON downloaded and GOOGLE_APPLICATION_CREDENTIALS set
- [ ] `npm install` completed in frontend
- [ ] `pip install -r requirements.txt` completed in backend
- [ ] `npm run dev` runs without errors
- [ ] `uvicorn main:app --reload` runs without errors

### Cloud Deployment (Cloud Run + Firebase Hosting)

1. **Backend Deployment**
   ```bash
   cd backend
   gcloud run deploy svos-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --set-env-vars GCP_PROJECT_ID=diesel-command-493401-q7 \
     --set-env-vars PUBSUB_CROWD_TOPIC=crowd-data \
     --set-env-vars BIGQUERY_DATASET=svos_analytics \
     --set-env-vars BIGQUERY_TABLE=crowd_events \
     --set-env-vars GEMINI_API_KEY=YOUR_KEY \
     --allow-unauthenticated
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

3. **Update Frontend Environment for Prod**
   ```bash
   # frontend/.env.production
   VITE_BACKEND_URL=https://svos-backend-xxxxx.a.run.app
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
   # Firebase config is already in .env.local
   ```

---

## Service Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  Google Maps SDK │    │   AnalyticsDash  │              │
│  │  (Live Mapping)  │    │   (BigQuery Data)│              │
│  └────────┬─────────┘    └────────┬─────────┘              │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            │                      │ (fetch)
            │                      │
┌───────────┼──────────────────────┼──────────────────────────┐
│           └──────────┬───────────┘                          │
│                      │                                       │
│           ┌──────────▼──────────┐                          │
│           │   FastAPI Backend    │                          │
│           │   (main.py)          │                          │
│           └──────────┬───────────┘                          │
│                      │                                       │
│        ┌─────────────┼──────────────┐                       │
│        │             │              │                       │
│   ┌────▼───┐  ┌─────▼──────┐  ┌────▼────┐                │
│   │ Gemini  │  │  Pub/Sub   │  │BigQuery │                │
│   │  API    │  │ Publisher  │  │ Logger  │                │
│   └────┬────┘  └─────┬──────┘  └────┬────┘                │
│        │             │              │                       │
└────────┼─────────────┼──────────────┼───────────────────────┘
         │             │              │
    ┌────▼──────┬──────▼──┬───────────▼──────┐
    │            │         │                 │
┌───▼────┐  ┌────▼──┐  ┌──▼──────┐          │
│ Frontend│  │Pub/Sub│  │BigQuery │          │
│Response │  │Topics │  │Dataset  │          │
└─────────┘  └───────┘  └─────────┘          │
```

---

## Troubleshooting

### Maps Not Loading
- Check API key in browser console (Network tab)
- Verify API key is allowed for your domain
- Ensure VITE_GOOGLE_MAPS_API_KEY is set in .env.local

### Pub/Sub Not Publishing
- Check GOOGLE_APPLICATION_CREDENTIALS is set correctly
- Verify service account has Pub/Sub Editor role
- Check backend logs: `gcloud run logs read --limit=50`

### BigQuery Not Logging
- Verify dataset exists: `bq ls`
- Check service account has BigQuery Admin role
- Manually create table if needed (backend will auto-create on startup)
- Query data: `bq query 'SELECT * FROM svos_analytics.crowd_events LIMIT 10'`

### Authentication Errors
- Re-download service account key from Cloud Console
- Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Test: `gcloud auth list`

---

## Links & Resources

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Cloud Pub/Sub Docs](https://cloud.google.com/pubsub/docs)
- [BigQuery Docs](https://cloud.google.com/bigquery/docs)
- [Google Cloud CLI Reference](https://cloud.google.com/sdk/gcloud)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)

---

## Summary of Google Services Usage

| Service | Purpose | Status | Integration |
|---------|---------|--------|-------------|
| **Maps SDK** | Real-time venue mapping with crowd density | ✅ Active | Frontend: GoogleMapsVenue.jsx |
| **Pub/Sub** | Real-time crowd data streaming | ✅ Active | Backend: publish to topic every request |
| **BigQuery** | Historical analytics & crowd patterns | ✅ Active | Backend: log every zone update |
| **Gemini API** | AI Assistant for venue guidance | ✅ Active | Backend: /api/chat endpoint |
| **Firebase** | Auth + Real-time Database | ✅ Active | Frontend: firebase.js + hooks |
| **Cloud Run** | Serverless backend hosting | 🔄 Ready | Deployment: main.py |
| **Firebase Hosting** | Frontend CDN deployment | 🔄 Ready | Deployment: npm run build + firebase deploy |

