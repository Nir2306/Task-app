@echo off
echo ========================================
echo Update GitHub Remote with Personal Access Token
echo ========================================
echo.
echo Step 1: Go to https://github.com/settings/tokens
echo Step 2: Create a new token with 'repo' scope
echo Step 3: Copy the token
echo.
echo Run this command (replace YOUR_TOKEN):
echo.
echo git remote set-url origin https://YOUR_TOKEN@github.com/Nir2306/timesheet-tracker.git
echo.
echo Then push:
echo git push -u origin main
echo.
pause

