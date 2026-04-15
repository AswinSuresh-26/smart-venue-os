# 🚀 SVOS Deployment Checklist

**Deadline: April 19, 2026 11:59 PM IST**  
**Current Progress: API key verified ✅**

---

## ✅ Your Credentials (Already Configured)

```
Google Cloud Project: 64290534607
Project ID: diesel-command-493401-q7
Gemini API Key: AIzaSyCz05XnK6bPCNNDu_rqA1__wf6XPE4eX7o
Model: gemini-2.5-flash (Latest, verified working ✅)
```

---

## 📋 Pre-Deployment Phase (TODAY - April 15)

### 1. ✅ Firebase Project Setup
- [ ] Go to https://console.firebase.google.com
- [ ] Create project (or use existing): `diesel-command-493401-q7`
- [ ] Enable Realtime Database (Test mode)
- [ ] Enable Anonymous Authentication
- [ ] Get Firebase config from Project Settings → Your apps
- [ ] Copy config to `frontend/.env.local`

**Reference**: See [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

### 2. ✅ Environment Files Ready
```
✓ backend/.env.local → GEMINI_API_KEY already configured
✓ frontend/.env.local → Created, awaiting Firebase config
```

### 3. 🧪 Local Testing (30 min)

**Backend Test:**
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# Test: http://localhost:8000/health → should return {"status": "ok", ...}
```

**Frontend Test:**
```powershell
cd frontend
npm install
npm run dev
# Test: http://localhost:5173 → should load UI
# Toggle Attendee/Admin, test heatmap, AI chat
```

**AI Assistant Test:**
```powershell
# With backend running, type in AI Assistant:
"Where's the shortest food queue?"
# Should get response from Gemini API
```

### 4. 📦 Build for Production
```powershell
cd frontend
npm run build
# Creates dist/ folder (~500KB with minification)
```

---

## 🌐 Deployment Phase (April 15-17)

### 5. 🔗 GitHub Repository

```powershell
# Initialize repo
git init
git add .
git commit -m "Initial SVOS commit - Smart Venue OS with Gemini AI"
git branch -M main

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/svos.git
git push -u origin main
```

**Checklist:**
- [ ] Repo is PUBLIC (not private)
- [ ] Single main branch
- [ ] `.gitignore` excludes node_modules, .env.local, dist/
- [ ] README.md visible and complete
- [ ] Total size < 1MB

**Verify size:**
```powershell
git count-objects -v
# total should be < 1MB
```

### 6. 📱 Deploy Frontend (Firebase Hosting)

```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (in frontend directory)
cd frontend
firebase init hosting
# Select "dist" as public directory
# Say NO to single page app rewrite (we handle routing)

# Build and deploy
npm run build
firebase deploy --only hosting
```

**You'll get a URL like:**
```
https://diesel-command-493401-q7--default-rtdb.firebaseapp.com
```

- [ ] Frontend deployed and accessible
- [ ] Heatmap loads
- [ ] AI chat shows
- [ ] Admin dashboard visible

### 7. 🔧 Deploy Backend (Google Cloud Run)

**Option A: Local Build & Push**
```powershell
# Create Dockerfile (if not exists)
cd backend

# Build Docker image
docker build -t svos-backend .

# Tag for Google Cloud
docker tag svos-backend gcr.io/diesel-command-493401-q7/svos-backend

# Push to Google Cloud Registry
docker push gcr.io/diesel-command-493401-q7/svos-backend

# Deploy to Cloud Run
gcloud run deploy svos-backend `
  --image gcr.io/diesel-command-493401-q7/svos-backend `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars GEMINI_API_KEY=AIzaSyCz05XnK6bPCNNDu_rqA1__wf6XPE4eX7o
```

**Option B: Cloud Build (Easier)**
```powershell
gcloud builds submit --tag gcr.io/diesel-command-493401-q7/svos-backend --source=backend

gcloud run deploy svos-backend `
  --image gcr.io/diesel-command-493401-q7/svos-backend `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars GEMINI_API_KEY=AIzaSyCz05XnK6bPCNNDu_rqA1__wf6XPE4eX7o
```

**You'll get a URL like:**
```
https://svos-backend-xxxxx.run.app
```

- [ ] Backend deployed
- [ ] Health check: `curl https://svos-backend-xxxxx.run.app/health`
- [ ] Returns: `{"status": "ok", "timestamp": "..."}`

### 8. 🔗 Update Frontend Backend URL

After deploying backend, update `frontend/.env.local`:
```env
VITE_BACKEND_URL=https://svos-backend-xxxxx.run.app
```

Then redeploy frontend:
```powershell
cd frontend
npm run build
firebase deploy --only hosting
```

---

## 📝 Submission Phase (April 17-19)

### 9. 📝 LinkedIn Post

Copy from [LINKEDIN_POST.md](LINKEDIN_POST.md) and post on LinkedIn. Include:
- Problem statement
- Solution highlights
- Tech stack
- GitHub link
- Live demo link

**Hashtags:** `#AI #SmartCities #GoogleCloud #Hackathon #MachineLearning`

### 10. 📋 Submission Form (PromptWars)

Fill the hackathon submission form with:

```
Challenge Vertical: Physical Event Experience

Your Solution Name: Smart Venue OS (SVOS)

Public GitHub Repository: 
https://github.com/YOUR_USERNAME/svos

Deployed Link (Live Demo):
https://YOUR-FIREBASE-PROJECT.firebaseapp.com

LinkedIn Post URL:
https://linkedin.com/feed/update/...

(Optional Backend API):
https://svos-backend-xxxxx.run.app
```

**Final Checklist:**
- [ ] GitHub repo is public
- [ ] Repo size < 1MB
- [ ] Frontend deployed and live
- [ ] Backend deployed and responding
- [ ] AI chat works with Gemini
- [ ] README.md is complete
- [ ] LinkedIn post published
- [ ] Form submitted before April 19, 11:59 PM IST

---

## 🧪 Quality Assurance

### Browser Testing
- [ ] Chrome: Load dashboard, test all features
- [ ] Firefox: Check responsive design
- [ ] Mobile (iPhone/Android): Touch interactions work

### Feature Testing
- [ ] **Attendee View**: Heatmap clicks, queue panel, AI chat
- [ ] **Admin View**: Stats display, alerts show, dashboard updates
- [ ] **AI Assistant**: Responds to questions with Gemini
- [ ] **No errors** in browser console

### Performance Checks
- [ ] Frontend loads < 3 seconds
- [ ] First paint < 1 second
- [ ] AI responses < 5 seconds

### Security Checks
- [ ] ✅ Gemini API key only in backend
- [ ] ✅ Firebase config exposed (public, normal for web apps)
- [ ] ✅ No hardcoded Anthropic keys
- [ ] ✅ CORS configured properly

---

## 🎯 Evaluation Scoring

Your submission will be evaluated on:

| Criteria | Your Implementation | Score Impact |
|----------|-------------------|--------------|
| **Code Quality** | React components, clean architecture | 20% |
| **Security** | Server-side API key, no data leaks | 20% |
| **Efficiency** | Optimized bundle, fast API calls | 20% |
| **Testing** | Error handling, edge cases covered | 15% |
| **Accessibility** | Semantic HTML, color contrast | 15% |
| **Google Services** | Firebase + Gemini integration | 10% |

**Your Strengths:**
✅ Firebase Realtime DB (live data sync)  
✅ Google Gemini 2.5 Flash (latest AI model)  
✅ Cloud Run deployment (serverless)  
✅ Semantic HTML structure  
✅ Dark theme with good contrast  
✅ No external dependencies bloat  

---

## 📞 Troubleshooting

**Problem: Firebase config not loading**
- Check `.env.local` has all 7 variables filled
- Run `npm run dev` in frontend directory
- Check browser console for errors

**Problem: AI Assistant doesn't respond**
- Verify backend is running: `http://localhost:8000/health`
- Check backend `.env.local` has GEMINI_API_KEY
- Check browser console for API errors

**Problem: Repo too large**
- Remove `node_modules/`: `rm -r frontend/node_modules backend/venv`
- Verify `.gitignore` has proper entries
- Run `git clean -fd` before committing

**Problem: Deployment fails**
- Check Google Cloud project ID is correct
- Verify Docker is installed (for Cloud Run)
- Check database URL format in frontend `.env.local`

---

## ⏰ Timeline

| Date | Task | Status |
|------|------|--------|
| Apr 15 | API key verified ✅ | ✅ |
| Apr 15-16 | Local testing | 📋 TODO |
| Apr 16 | GitHub push | 📋 TODO |
| Apr 16-17 | Deploy frontend & backend | 📋 TODO |
| Apr 17 | LinkedIn post | 📋 TODO |
| Apr 17-19 | Submit to PromptWars | 📋 TODO |
| Apr 19 11:59 PM | **DEADLINE** | 🎯 |

---

## 🚀 Ready to Ship?

Before submitting, run this final check:

```bash
# 1. Frontend builds
cd frontend && npm run build

# 2. Backend starts
cd ../backend && uvicorn main:app --reload &

# 3. Test endpoints work
curl http://localhost:8000/health
curl http://localhost:5173

# 4. Check repo size
git count-objects -v

# 5. All good! Push to GitHub
git add . && git commit -m "Final submission ready" && git push
```

**Then submit on PromptWars before the deadline!** 🎉

