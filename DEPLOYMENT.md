# Deployment Guide

## Quick Start

### Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in Firebase config in .env.local
npm run dev  # Local dev
npm run build  # For production
```

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env.local
export GEMINI_API_KEY=your_key  # or set in .env.local
uvicorn main:app --reload
```

## Cloud Deployment

### Deploy Frontend to Firebase Hosting

```bash
cd frontend
npm install -g firebase-tools
firebase login
firebase init hosting
# Select "dist" as public directory
npm run build
firebase deploy --only hosting
```

### Deploy Backend to Google Cloud Run

```bash
cd backend
gcloud init
gcloud auth application-default login
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/svos-backend
gcloud run deploy svos-backend \
  --image gcr.io/YOUR_PROJECT_ID/svos-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key
```

## Environment Setup

### Firebase Console Setup
1. Go to https://console.firebase.google.com
2. Create new project "SVOS"
3. Enable Firebase Authentication (Anonymous)
4. Create Realtime Database
5. Copy config values to `frontend/.env.local`

### Google Gemini API
1. Get key from https://aistudio.google.com/app/apikey
2. Set as environment variable in Cloud Run console or backend .env.local

## File Size Management (< 1MB requirement)

- No build artifacts (`dist/`, `__pycache__/`) in repo
- No node_modules or venv in repo
- Use `.gitignore` to exclude
- Clean build: `npm run build` locally, deploy dist only

## Testing Deployments

**Frontend**: https://your-project.firebaseapp.com
**Backend**: https://svos-backend-xxxxx.run.app/health

Both should be publicly accessible for judges to test.
