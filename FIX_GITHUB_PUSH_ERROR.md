# Fix GitHub Push Permission Error (403)

## Problem
You're getting: `Permission denied to Nirvesh-SC` when pushing to `Nir2306/timesheet-tracker`

## Solutions (Try in order)

### Solution 1: Use Personal Access Token (Easiest)

GitHub no longer accepts passwords for HTTPS. You need a Personal Access Token.

#### Step 1: Create Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: `Vercel Deployment`
4. Select scopes: Check **"repo"** (gives full repository access)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you'll only see it once!)

#### Step 2: Update Remote URL with Token
Run this command (replace YOUR_TOKEN with the token you copied):

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/Nir2306/timesheet-tracker.git
```

Then try pushing again:
```bash
git push -u origin main
```

You'll be prompted for username - enter: `Nir2306`
Password - enter: `YOUR_TOKEN` (the token you created)

---

### Solution 2: Use SSH (More Secure, No Password)

#### Step 1: Check if you have SSH key
```bash
ls ~/.ssh/id_rsa.pub
```

If file exists, skip to Step 3.

#### Step 2: Generate SSH Key (if needed)
```bash
ssh-keygen -t ed25519 -C "nirvesh.jeewooth@spoonconsulting.com"
```
Press Enter to accept defaults (no passphrase needed, or add one for security)

#### Step 3: Copy SSH Key
```bash
cat ~/.ssh/id_rsa.pub
```
**Copy the entire output** (starts with `ssh-ed25519`)

#### Step 4: Add SSH Key to GitHub
1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `My Computer`
4. Key: Paste the key you copied
5. Click **"Add SSH key"**

#### Step 5: Update Remote to Use SSH
```bash
git remote set-url origin git@github.com:Nir2306/timesheet-tracker.git
```

#### Step 6: Test Connection
```bash
ssh -T git@github.com
```
You should see: "Hi Nir2306! You've successfully authenticated..."

#### Step 7: Push
```bash
git push -u origin main
```

---

### Solution 3: Verify Repository Ownership

**Check if the repository belongs to the correct account:**

1. Go to: https://github.com/Nir2306/timesheet-tracker
2. Verify you can see the repository
3. If you can't access it, you might need to:
   - Create a new repository with your correct username
   - Or get access to the existing one

---

### Solution 4: Use GitHub Desktop (Easiest Alternative)

If command line is giving you trouble:

1. Download: https://desktop.github.com/
2. Sign in with your GitHub account
3. File → Add Local Repository
4. Select your project folder
5. Click "Publish repository"
6. Choose name and visibility
7. Click "Publish repository"

---

## Quick Fix (Recommended)

**Use Personal Access Token (Solution 1)** - It's the fastest:

1. Create token: https://github.com/settings/tokens
2. Update remote:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/Nir2306/timesheet-tracker.git
   ```
3. Push:
   ```bash
   git push -u origin main
   ```

---

## Still Having Issues?

Check:
- [ ] Your GitHub username is `Nir2306` (not `Nirvesh-SC`)
- [ ] Repository exists and you have access
- [ ] Token has "repo" scope enabled
- [ ] You're using the correct remote URL

