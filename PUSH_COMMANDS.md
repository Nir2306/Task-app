# Commands to Fix and Push to GitHub

## After creating your Personal Access Token:

### 1. Update remote URL with your token:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/Nir2306/timesheet-tracker.git
```

**Replace `YOUR_TOKEN` with the token you created!**

### 2. Push to GitHub:
```bash
git push -u origin main
```

**When prompted:**
- Username: `Nir2306`
- Password: `YOUR_TOKEN` (paste your token here)

---

## Alternative: Use SSH (More Secure)

If you prefer SSH (no password needed after setup):

### 1. Update remote to SSH:
```bash
git remote set-url origin git@github.com:Nir2306/timesheet-tracker.git
```

### 2. Make sure you have SSH key added to GitHub, then:
```bash
git push -u origin main
```

---

## Quick Summary

**Easiest method:**
1. Create token at: https://github.com/settings/tokens
2. Run: `git remote set-url origin https://YOUR_TOKEN@github.com/Nir2306/timesheet-tracker.git`
3. Run: `git push -u origin main`
4. Enter username: `Nir2306`
5. Enter password: `YOUR_TOKEN`

