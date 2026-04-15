# SVOS Submission Checklist

Use this checklist before final submission to PromptWars.

## Pre-Submission

- [ ] **GitHub Repo Created**
  - [ ] Repository is PUBLIC
  - [ ] Single branch (main)
  - [ ] Repo size < 1MB (run: `git count-objects -v`)
  - [ ] All code committed and pushed

- [ ] **Code Quality**
  - [ ] Frontend builds without errors: `npm run build` ✓
  - [ ] Backend starts without error: `uvicorn main:app` ✓
  - [ ] No console errors when running locally
  - [ ] `.gitignore` excludes node_modules, dist, __pycache__

- [ ] **Environment Setup**
  - [ ] `.env.example` files present (no real keys)
  - [ ] Firebase config documented
  - [ ] Gemini API key placeholder noted

- [ ] **Documentation**
  - [ ] README.md complete and clear
  - [ ] DEPLOYMENT.md has setup steps
  - [ ] Tech stack listed
  - [ ] Problem/solution explained
  - [ ] Assumptions documented

- [ ] **Google Services Integration**
  - [ ] Firebase Auth (anonymous) implemented ✓
  - [ ] Firebase Realtime DB structure shown ✓
  - [ ] Cloud Run deployment option provided ✓
  - [ ] At least 3 Google Services meaningfully used

- [ ] **Deployment Ready**
  - [ ] Frontend deployed to Firebase Hosting
  - [ ] Backend deployed to Cloud Run (optional but impressive)
  - [ ] Both URLs are publicly accessible
  - [ ] Demo works without additional setup

- [ ] **LinkedIn Post Ready**
  - [ ] Post written (see LINKEDIN_POST.md)
  - [ ] Hashtags included
  - [ ] Link to GitHub (and deployed demo if applicable)
  - [ ] 100-150 words, punchy and professional

## Submission Form

Fill this in when submitting:

```
Challenge Vertical: Physical Event Experience

Public GitHub Repository Link:
https://github.com/YOUR_USERNAME/svos

Deployed Link (Cloud Run / Firebase):
https://your-project.firebaseapp.com

LinkedIn Post:
[Paste LinkedIn post content]

Notes for Judges:
- Toggle Attendee/Admin in top nav to see both views
- AI Assistant requires Firebase setup (or works in demo mode)
- Crowd data updates every 4 seconds (live simulation)
- All code under 1MB
```

## Final Checks

Before hitting "Submit":

1. **Is the repo public?** → Check GitHub URL is not private
2. **Can judges clone & run?** → Yes, with Firebase config
3. **Does it work on deployed URL?** → Test in fresh browser
4. **Is code clean?** → No console errors, proper structure
5. **Are Google Services integrated?** → Firebase + Gemini visible
6. **Is README helpful?** → Could someone deploy this?
7. **Is LinkedIn post compelling?** → Would you share it?

---

## Troubleshooting Before Submission

**Frontend not loading?**
```bash
cd frontend && npm install && npm run build
```

**Backend 500 error?**
- Check GEMINI_API_KEY is set
- Verify Firebase config in .env.local

**"Repository size too large"?**
```bash
git rm -r --cached node_modules dist __pycache__
git commit -m "Remove build artifacts"
```

**Firebase auth not working?**
- Enable Anonymous Auth in Firebase console
- Check API keys in .env.local

---

**Good luck! 🚀**
