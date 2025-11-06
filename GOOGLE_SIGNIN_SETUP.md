# Google Sign-In Setup Guide

This app supports Google Sign-In for easy authentication. Follow these steps to enable it:

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application** as the application type
4. Add your authorized JavaScript origins:
   - `http://localhost:5173` (for local development)
   - Your production domain (e.g., `https://yourdomain.com`)
5. Add authorized redirect URIs (same as above)
6. Click **Create**
7. Copy your **Client ID**

## Step 3: Configure the App

1. Create a `.env` file in the root directory of your project
2. Add your Google Client ID:

```
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

3. Restart your development server for the changes to take effect

## Step 4: Test

1. Start your app with `npm run dev`
2. On the login page, you should see a "Sign in with Google" button
3. Click it to test the Google Sign-In flow

## Notes

- The Google Sign-In button will automatically adapt to light/dark mode
- User information (email, name) is automatically extracted from Google
- No password is required when signing in with Google
- The email confirmation is automatically sent after successful Google Sign-In

## Troubleshooting

If the Google Sign-In button doesn't appear:
- Check the browser console for errors
- Verify your Client ID is correct in the `.env` file
- Ensure the Google Sign-In script is loaded (check Network tab)
- Make sure your domain is added to authorized origins in Google Cloud Console

