# 🚀 Step-by-Step: Push to GitHub & Deploy to Vercel

## Part 1: Push Code to GitHub

### Step 1: Initialize Git (if not already done)
```bash
git init
```

### Step 2: Check What Will Be Committed
```bash
git status
```

### Step 3: Add All Files
```bash
git add .
```

### Step 4: Create Initial Commit
```bash
git commit -m "Initial commit - Timesheet Tracker app"
```

### Step 5: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `timesheet-tracker` (or any name you like)
4. Description (optional): "A timesheet tracking app with offline support"
5. **Make it Public** (or Private if you prefer)
6. **DO NOT** check "Initialize with README" (we already have files)
7. Click **"Create repository"**

### Step 6: Link Local Repository to GitHub

GitHub will show you commands. Use these (replace YOUR_USERNAME with your GitHub username):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## Part 2: Deploy to Vercel

### Step 1: Go to Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Make sure you're logged in
3. Click **"Add New..."** → **"Project"**

### Step 2: Import GitHub Repository
1. You should see your GitHub repositories listed
2. Find your `timesheet-tracker` repository
3. Click **"Import"** next to it

### Step 3: Configure Project Settings

Vercel will auto-detect Vite, but verify these settings:

- **Framework Preset**: Should be `Vite` (auto-detected)
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build` (should be auto-filled)
- **Output Directory**: `dist` (should be auto-filled)
- **Install Command**: `npm install` (should be auto-filled)

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these **7 variables**:

```
Variable Name: VITE_FIREBASE_API_KEY
Value: AIzaSyCV5ocypqM29YWAHiEMhdSSLPQhAnWdMdc

Variable Name: VITE_FIREBASE_AUTH_DOMAIN
Value: taskapp-477218.firebaseapp.com

Variable Name: VITE_FIREBASE_PROJECT_ID
Value: taskapp-477218

Variable Name: VITE_FIREBASE_STORAGE_BUCKET
Value: taskapp-477218.firebasestorage.app

Variable Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 708029154097

Variable Name: VITE_FIREBASE_APP_ID
Value: 1:708029154097:web:237ee8dbc209813fa32610

Variable Name: VITE_FIREBASE_MEASUREMENT_ID
Value: G-6KWD86238F
```

**Important**: Add each variable separately. Click "Add" after each one.

### Step 5: Deploy!

1. Click **"Deploy"** button at the bottom
2. Wait 2-3 minutes for the build to complete
3. You'll see "Building..." then "Ready" when done

### Step 6: Get Your Live URL

Once deployment completes:
- Your app will be live at: `https://your-project-name.vercel.app`
- Vercel will show you the URL
- Click it to open your live app!

---

## Part 3: Configure Firebase Authorized Domains

### Step 1: Get Your Vercel URL
- Copy your Vercel deployment URL (e.g., `timesheet-tracker.vercel.app`)

### Step 2: Add to Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **taskapp-477218**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Enter your Vercel domain: `your-project-name.vercel.app`
6. Click **"Add"**

**Important**: Without this step, Firebase authentication won't work on your deployed site!

---

## Part 4: Test Your Deployment

### Check These:
- [ ] App loads without errors
- [ ] Can sign up with email/password
- [ ] Can sign in
- [ ] Can add tasks
- [ ] Can view dashboard
- [ ] Can add notes
- [ ] Works on mobile browser

### If Something Doesn't Work:
1. Check browser console (F12) for errors
2. Check Vercel deployment logs
3. Verify all environment variables are set
4. Verify Firebase authorized domain is added

---

## Future Updates (Automatic Deployments)

**Good News**: Vercel automatically deploys when you push to GitHub!

### To Update Your App:
1. Make changes to your code
2. Commit changes:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Vercel automatically builds and deploys the new version!

---

## Troubleshooting

### Issue: "Build failed"
- Check Vercel deployment logs
- Make sure all environment variables are set
- Verify `npm run build` works locally

### Issue: "Firebase auth error"
- Verify authorized domain is added in Firebase Console
- Check environment variables are correct

### Issue: "Can't push to GitHub"
- Make sure you're logged into GitHub
- Verify repository exists on GitHub
- Check your Git credentials

---

## Summary

✅ **Step 1**: Initialize git and commit code  
✅ **Step 2**: Create GitHub repository  
✅ **Step 3**: Push code to GitHub  
✅ **Step 4**: Import project in Vercel  
✅ **Step 5**: Add environment variables  
✅ **Step 6**: Deploy  
✅ **Step 7**: Add Vercel domain to Firebase  
✅ **Step 8**: Test your live app!

---

**Your app will be live in about 10 minutes!** 🎉

