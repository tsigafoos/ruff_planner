# Setting Up Email Confirmation for Development

If you want to use email confirmation, you need to configure the redirect URL in Supabase.

## Steps:

1. **Go to Supabase Dashboard**
   - Navigate to **Authentication** → **URL Configuration**

2. **Set Redirect URLs**
   - Add these to "Redirect URLs":
     - `exp://localhost:8081` (for Expo Go)
     - `ruffplanner://` (your app scheme from app.json)
     - `http://localhost:8081` (for web development)

3. **Configure Email Templates**
   - Go to **Authentication** → **Email Templates**
   - Click on "Confirm signup" template
   - Find the confirmation link in the template
   - It should automatically use the redirect URL you configured

4. **For Production**
   - Add your production URLs:
     - `https://yourdomain.com/auth/callback`
     - `your-app-scheme://` (for mobile apps)

## Alternative: Use Magic Link Instead

Magic links work better with mobile apps. Users click the link, and it opens the app automatically.

## Quick Fix for Development

**Easiest solution**: Just disable email confirmation in Authentication → Settings, then re-enable it when you're ready for production.
