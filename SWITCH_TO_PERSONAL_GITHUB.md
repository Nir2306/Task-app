# Switch to Personal GitHub Account

## Step-by-Step Guide

### Step 1: Remove Current Remote
```bash
git remote remove origin
```

### Step 2: Create New Repository on Your Personal GitHub

1. Go to: **https://github.com/new**
2. Make sure you're logged into your **PERSONAL** GitHub account (not work)
3. Repository name: `timesheet-tracker` (or any name you like)
4. Description (optional): "Timesheet Tracker app"
5. Choose **Public** or **Private**
6. **DO NOT** check "Initialize with README"
7. Click **"Create repository"**

### Step 3: Add Your Personal Repository as Remote

After creating the repository, GitHub will show you the URL.

**Replace `YOUR_PERSONAL_USERNAME` with your actual GitHub username:**

```bash
git remote add origin https://github.com/YOUR_PERSONAL_USERNAME/timesheet-tracker.git
```

**Example:**
If your personal GitHub username is `johndoe`, use:
```bash
git remote add origin https://github.com/johndoe/timesheet-tracker.git
```

### Step 4: Push to Your Personal Repository

```bash
git push -u origin main
```

**If you get authentication error:**
- You'll need to create a Personal Access Token for your personal account
- Go to: https://github.com/settings/tokens
- Generate new token with `repo` scope
- Use the token as password when pushing

---

## Alternative: Use SSH (No Password Needed)

### Step 1: Remove Current Remote
```bash
git remote remove origin
```

### Step 2: Create Repository on Personal GitHub
(Same as above)

### Step 3: Add SSH Remote
```bash
git remote add origin git@github.com:YOUR_PERSONAL_USERNAME/timesheet-tracker.git
```

### Step 4: Make Sure SSH Key is Added to Personal Account
1. Check if you have SSH key: `cat ~/.ssh/id_rsa.pub`
2. If not, generate one: `ssh-keygen -t ed25519 -C "your-email@example.com"`
3. Copy public key: `cat ~/.ssh/id_rsa.pub`
4. Add to personal GitHub: https://github.com/settings/keys
5. Click "New SSH key" and paste your key

### Step 5: Push
```bash
git push -u origin main
```

---

## Verify You're Using Personal Account

**Check your Git credentials:**
```bash
git config user.name
git config user.email
```

**If you want to use different credentials for this project:**
```bash
git config user.name "Your Personal Name"
git config user.email "your-personal-email@example.com"
```

**Or set globally (for all projects):**
```bash
git config --global user.name "Your Personal Name"
git config --global user.email "your-personal-email@example.com"
```

---

## Quick Commands Summary

**Option 1: HTTPS (with Personal Access Token)**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_PERSONAL_USERNAME/timesheet-tracker.git
git push -u origin main
```

**Option 2: SSH (no password after setup)**
```bash
git remote remove origin
git remote add origin git@github.com:YOUR_PERSONAL_USERNAME/timesheet-tracker.git
git push -u origin main
```

---

## Important Notes

⚠️ **Make sure you're logged into your PERSONAL GitHub account** when creating the repository!

⚠️ **If you use HTTPS**, you'll need a Personal Access Token from your **personal account** (not work account)

⚠️ **If you use SSH**, make sure your SSH key is added to your **personal GitHub account** settings

---

## After Pushing

Once your code is on your personal GitHub:
1. Go to Vercel
2. Import the repository from your **personal** GitHub account
3. Deploy as usual!

