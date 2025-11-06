# 🚀 Deployment Guide - Free Hosting Options

This guide will help you deploy your Timesheet Tracker app to a free hosting platform.

## Quick Start: Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account (free)
- Vercel account (free)

### Step 1: Push Code to GitHub

1. Create a new repository on GitHub
2. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Import your GitHub repository
5. Vercel will auto-detect Vite settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Add Environment Variables** (click "Environment Variables"):
   ```
   VITE_FIREBASE_API_KEY=AIzaSyCV5ocypqM29YWAHiEMhdSSLPQhAnWdMdc
   VITE_FIREBASE_AUTH_DOMAIN=taskapp-477218.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=taskapp-477218
   VITE_FIREBASE_STORAGE_BUCKET=taskapp-477218.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=708029154097
   VITE_FIREBASE_APP_ID=1:708029154097:web:237ee8dbc209813fa32610
   VITE_FIREBASE_MEASUREMENT_ID=G-6KWD86238F
   ```
7. Click **"Deploy"**
8. Wait ~2 minutes for deployment
9. Your app will be live at `https://your-project-name.vercel.app`

### Step 3: Configure Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `taskapp-477218`
3. Go to **Authentication** > **Settings** > **Authorized domains**
4. Add your Vercel domain: `your-project-name.vercel.app`
5. Click **Add**

✅ **Done!** Your app is now live and free!

---

## Alternative: Deploy to Netlify

### Step 1: Push Code to GitHub
(Same as Vercel Step 1)

### Step 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click **"Add new site"** > **"Import an existing project"**
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. **Add Environment Variables** (click "Environment variables"):
   ```
   VITE_FIREBASE_API_KEY=AIzaSyCV5ocypqM29YWAHiEMhdSSLPQhAnWdMdc
   VITE_FIREBASE_AUTH_DOMAIN=taskapp-477218.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=taskapp-477218
   VITE_FIREBASE_STORAGE_BUCKET=taskapp-477218.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=708029154097
   VITE_FIREBASE_APP_ID=1:708029154097:web:237ee8dbc209813fa32610
   VITE_FIREBASE_MEASUREMENT_ID=G-6KWD86238F
   ```
7. Click **"Deploy site"**
8. Your app will be live at `https://random-name.netlify.app`

### Step 3: Configure Firebase Authorized Domains
(Same as Vercel Step 3, but add your Netlify domain)

---

## Alternative: Deploy to Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase Hosting
```bash
firebase init hosting
```
Select:
- Use an existing project: `taskapp-477218`
- Public directory: `dist`
- Single-page app: `Yes`
- Set up automatic builds: `No` (or Yes if you want)

### Step 4: Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at `https://taskapp-477218.web.app`

---

## Post-Deployment Checklist

### ✅ Firebase Configuration
- [ ] Add your deployment domain to Firebase Authorized Domains
- [ ] Verify Firestore security rules are published
- [ ] Test authentication (sign up, sign in, Google Sign-In)

### ✅ App Functionality
- [ ] Test adding tasks
- [ ] Test adding notes
- [ ] Test dashboard charts
- [ ] Test offline functionality
- [ ] Test on mobile devices

### ✅ Performance
- [ ] Check page load time
- [ ] Test on slow connections
- [ ] Verify all assets load correctly

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings > Domains
2. Add your domain
3. Follow DNS instructions

### Netlify
1. Go to Site Settings > Domain Management
2. Add your domain
3. Follow DNS instructions

### Firebase Hosting
1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow setup instructions

---

## Troubleshooting

### Issue: "Firebase: Error (auth/unauthorized-domain)"
**Solution**: Add your deployment domain to Firebase Authorized Domains in Firebase Console

### Issue: "Environment variables not working"
**Solution**: 
- Ensure variables start with `VITE_` prefix
- Redeploy after adding variables
- Check variable names match exactly

### Issue: "Build fails"
**Solution**:
- Check build logs for errors
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

### Issue: "Firestore permission denied"
**Solution**: 
- Check Firestore security rules are published
- Verify rules allow authenticated users (see FIREBASE_SETUP.md)

---

## Cost Comparison

All options are **FREE** for this app:

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| **Vercel** | Unlimited projects | Easiest setup, best DX |
| **Netlify** | 100GB bandwidth/month | Good alternative to Vercel |
| **Firebase Hosting** | 10GB storage | If already using Firebase |
| **GitHub Pages** | Unlimited public repos | Open source projects |

---

## Recommendation

**Use Vercel** - It's the easiest and fastest option:
- ✅ Zero configuration
- ✅ Automatic deployments
- ✅ Free SSL
- ✅ Global CDN
- ✅ Preview deployments for testing

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check Firebase Console for authentication errors
3. Review deployment logs in your hosting platform
4. Verify all environment variables are set correctly

