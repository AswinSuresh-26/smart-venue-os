# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Create a project"** or **"Add project"**
3. Project name: `SVOS` (or your choice)
4. Accept terms and create

## Step 2: Get Firebase Config

1. In Firebase Console, click the **gear icon** (⚙️) → **Project Settings**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. App nickname: `SVOS-Frontend` (any name)
5. Click **"Register app"**
6. Copy the `firebaseConfig` object (you'll see something like):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234..."
};
```

## Step 3: Fill in .env.local

Edit `frontend/.env.local` and add Firebase values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234...

VITE_BACKEND_URL=http://localhost:8000
```

## Step 4: Enable Realtime Database

1. In Firebase Console, go to **Realtime Database** (left menu)
2. Click **"Create Database"**
3. Choose location: `us-central1` (or closest to you)
4. Start in **Test mode** (for development)
5. Click **"Enable"**

## Step 5: Enable Anonymous Auth

1. In Firebase Console, go to **Authentication** (left menu → Build)
2. Click **"Get Started"**
3. In **Sign-in method**, click **Anonymous**
4. Toggle **Enable** and save

## Step 6: Done! ✅

Your Firebase is now configured. Run the app:

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (in another terminal)
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Visit `http://localhost:5173` (frontend will show)

## Troubleshooting

**"Firebase config is empty"**
- Make sure `.env.local` has all 7 Firebase keys filled in

**"Can't reach backend"**
- Make sure backend is running on `http://localhost:8000`
- Check `VITE_BACKEND_URL` in `.env.local`

**"Gemini API returns error"**
- Verify `GEMINI_API_KEY` is correct in `backend/.env.local`
- Check API key is enabled in Google Cloud Console

