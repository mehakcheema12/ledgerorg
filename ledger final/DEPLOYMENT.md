# Deployment Guide - Ledger App

## Option 1: Vercel (Frontend) + Railway (Backend) ⭐ RECOMMENDED

### Frontend (Vercel)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New" → "Project"
4. Import your GitHub repo
5. Set Root Directory: `client`
6. Add Environment Variable:
   - `VITE_API_URL=https://your-railway-app.railway.app` (your backend URL)
7. Deploy!

### Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo
4. Add these Environment Variables in Railway dashboard:
   - `MONGO_URI` (from your .env)
   - `JWT_SECRET` (from your .env)
   - `JWT_EXPIRES_IN=7d`
   - `PORT=5001`
   - `CLIENT_URL=https://your-vercel-app.vercel.app`
5. Railway auto-detects Node.js and deploys!

---

## Option 2: Render.com (Both Frontend & Backend)

### Backend
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repo, select it
4. Set Root Directory: `server`
5. Runtime: Node
6. Add Environment Variables (same as above)
7. Deploy!

### Frontend
1. Click "New +" → "Static Site"
2. Connect same GitHub repo
3. Set Root Directory: `client`
4. Build Command: `npm run build`
5. Publish Directory: `dist`
6. Add build environment variable:
   - `VITE_API_URL=https://your-render-backend.onrender.com`
7. Deploy!

---

## Option 3: Heroku (Both) - Simple but needs credit card

1. Install Heroku CLI
2. Create two apps: `ledger-api` and `ledger-client`
3. Configure buildpacks for each
4. Set environment variables in Heroku dashboard
5. Deploy with git push

---

## Setup Your Frontend API URL

Update your client API service to use the environment variable:

**File: `client/src/services/api.js`**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const api = axios.create({
  baseURL: API_BASE_URL,
});
```

---

## Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster is set up and connection string is working
- [ ] Both `package.json` files have proper scripts (`npm run dev`, `npm run build`)
- [ ] `.env` file is in `.gitignore` (don't commit secrets!)
- [ ] CORS is properly configured in server for your frontend URL
- [ ] JWT_SECRET is changed from the dev value
- [ ] Test locally with both servers running

---

## 📋 COMPLETE STEP-BY-STEP DEPLOYMENT GUIDE (For Beginners)

### **The Easiest Path: Vercel + Railway**

Follow these steps **in exact order**. Don't skip any!

---

## STEP 1: Push Your Code to GitHub (10 mins)

1. Go to [github.com](https://github.com) and log in (create account if needed)
2. Click **"+"** → **"New repository"**
3. Name: `ledger` (or whatever you want)
4. Click **"Create repository"** (keep it public for free deployments)
5. Copy the commands GitHub shows you and run in terminal:
   ```bash
   cd /Users/mehakpreetkaurcheema/Downloads/ledger\ final
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ledger.git
   git push -u origin main
   ```
6. ✅ Your code is now on GitHub!

---

## STEP 2: Change Your JWT_SECRET (2 mins) ⚠️ IMPORTANT

Before deploying, change the dev secret to something random:

1. Open `server/.env`
2. Change this line:
   ```
   JWT_SECRET=ledger-local-dev-secret-change-me
   ```
   To something like:
   ```
   JWT_SECRET=mY_sUp3r_s3cr3t_k3y_123_random_stuff
   ```
3. Save the file
4. Run in terminal:
   ```bash
   cd /Users/mehakpreetkaurcheema/Downloads/ledger\ final
   git add server/.env
   git commit -m "Update JWT secret"
   git push
   ```
5. ✅ Secret is updated on GitHub!

---

## STEP 3: Deploy Backend to Railway (5 mins)

1. Go to [railway.app](https://railway.app)
2. Click **"Create Account"** → sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `ledger` repository
5. Click **"Deploy Now"**
6. Wait 1-2 minutes for deployment
7. Once deployed, click on your project → **"Settings"** → copy the **URL** (looks like: `https://ledger-production-xxx.railway.app`)
8. Click **"Variables"** and add these:
   - `MONGO_URI`: (copy from your local `.env` file)
   - `JWT_SECRET`: (the new one you just set)
   - `JWT_EXPIRES_IN`: `7d`
   - `PORT`: `5001`
   - `CLIENT_URL`: (you'll update this in Step 5)
9. Click **"Deploy"**
10. ✅ Backend is live!

**Save your Railway URL somewhere!** You'll need it in Step 5.

---

## STEP 4: Deploy Frontend to Vercel (5 mins)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → sign in with GitHub
3. Click **"Add New"** → **"Project"**
4. Select your `ledger` repository
5. In settings:
   - **Root Directory**: `client`
   - Click **"Environment Variables"**
   - Add: `VITE_API_URL` = `https://your-railway-backend-url.railway.app` (paste your Railway URL from Step 3)
6. Click **"Deploy"**
7. Wait 1-2 minutes
8. Once done, your Vercel dashboard shows your live URL (looks like: `https://ledger-xxx.vercel.app`)
9. ✅ Frontend is live!

**Save your Vercel URL!**

---

## STEP 5: Update Backend with Frontend URL (2 mins)

Go back to Railway and update `CLIENT_URL`:

1. Go to [railway.app](https://railway.app)
2. Click your `ledger` project
3. Click **"Variables"**
4. Change `CLIENT_URL` to your Vercel URL (from Step 4)
5. Click **"Deploy"** to redeploy with new settings
6. ✅ Done!

---

## ✅ Testing Your Live App

1. Open your Vercel URL in browser: `https://your-vercel-app.vercel.app`
2. Try to **Register** a new user
3. Try to **Login**
4. Try to **Create a habit**
5. If it works → **You're deployed! 🎉**

---

## TROUBLESHOOTING

**Frontend loads but shows errors:**
- Check that `VITE_API_URL` in Vercel is set correctly
- Make sure Backend URL doesn't have a trailing slash

**Can't login/register:**
- Check MongoDB connection in Railway (should see "MongoDB connected" in logs)
- Verify `MONGO_URI` is correct in Railway variables

**Looks weird/no styling:**
- Do a hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
- Clear browser cache and reload

---

## Quick Summary

| Step | Service | Time | What Happens |
|------|---------|------|--------------|
| 1 | GitHub | 10m | Your code is backed up online |
| 2 | Your Editor | 2m | Secret key is changed |
| 3 | Railway | 5m | Your API is live (backend) |
| 4 | Vercel | 5m | Your website is live (frontend) |
| 5 | Railway | 2m | They can talk to each other |
| **TOTAL** | | **~24 mins** | **Live and working!** ✅ |
