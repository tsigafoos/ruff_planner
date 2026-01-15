# BarkItDone Setup Guide

This guide will walk you through setting up and running the BarkItDone app.

## Step 1: Verify Dependencies Are Installed

The dependencies should already be installed, but let's verify:

```bash
npm install
```

If you encounter any errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Account and Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: BarkItDone (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is fine for development

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

### 2.3 Set Up Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Replace the placeholder values with your actual Supabase URL and anon key.

### 2.4 Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (in the sidebar)
2. Click **New Query**
3. Copy the entire contents of `sql/supabase-setup.sql`
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
6. You should see "Success. No rows returned" - this is normal!

This creates:
- The `projects`, `tasks`, and `labels` tables
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers to update timestamps

### 2.5 (Optional) Enable Realtime

If you want real-time sync:

1. Go to **Database** → **Replication** in Supabase dashboard
2. Enable replication for:
   - `projects`
   - `tasks`
   - `labels`

## Step 3: Test the App Locally

### 3.1 Start the Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Open Expo DevTools in your browser
- Show a QR code you can scan with the Expo Go app

### 3.2 Run on Your Platform

**Option A: Use Expo Go (Easiest for Testing)**
- Install Expo Go on your phone (iOS App Store or Google Play)
- Scan the QR code with:
  - **iOS**: Camera app
  - **Android**: Expo Go app

**Option B: Run on Simulator/Emulator**

```bash
# iOS (macOS only)
npm run ios

# Android (requires Android Studio)
npm run android

# Web
npm run web
```

## Step 4: Test the App

### 4.1 Create an Account

1. When the app opens, you should see the login screen
2. Click "Don't have an account? Sign up"
3. Enter an email and password
4. Click "Sign Up"
5. Check your email for a verification link (if email confirmation is enabled)
6. Sign in with your credentials

### 4.2 Test Basic Functionality

1. **Create a Task**:
   - Go to the Inbox tab
   - Use the QuickAdd bar at the bottom to add a task
   - Tap the task to see details

2. **Create a Project**:
   - Go to the Projects tab
   - Tap "+ New Project"
   - Enter a name and choose a color
   - Tap "Create"

3. **Create a Label**:
   - Go to the Labels tab
   - Tap "+ New Label"
   - Enter a name and choose a color
   - Tap "Create"

4. **Test Sync** (when online):
   - Create a task
   - Check your Supabase dashboard → Table Editor → `tasks` table
   - You should see your task there!

## Step 5: Troubleshooting

### App Won't Start

- **Error: "Cannot find module"**: Run `npm install` again
- **Error: "Expo not found"**: Install Expo CLI globally: `npm install -g expo-cli`
- **Port already in use**: Kill the process using port 8081 or use a different port

### Authentication Issues

- **"Invalid login credentials"**: Check that you created an account first
- **"Email not confirmed"**: Check your email for the verification link
- **Supabase connection error**: Verify your `.env` file has the correct credentials

### Database Errors

- **"Table doesn't exist"**: Make sure you ran the SQL setup script in Supabase
- **"Permission denied"**: Check that Row Level Security policies are set up correctly
- **Sync not working**: 
  - Check your internet connection
  - Verify Supabase credentials are correct
  - Check browser console for error messages

### WatermelonDB Errors

- **Database initialization error**: 
  - Clear app data and restart
  - On web: Clear browser cache
  - On mobile: Uninstall and reinstall the app

## Step 6: Next Steps

Once everything is working:

1. **Customize the App**:
   - Update `app.json` with your app name and branding
   - Modify colors in `constants/Colors.ts`
   - Add your app icon to `assets/images/`

2. **Add More Features**:
   - Implement task editing (currently QuickAdd only)
   - Add drag & drop reordering
   - Add search functionality
   - Implement dark mode
   - Add notifications

3. **Deploy**:
   - **Web**: Use `expo export:web` and deploy to Vercel/Netlify
   - **iOS**: Use EAS Build to create an app store build
   - **Android**: Use EAS Build to create a Play Store build

## Need Help?

- Check the main `markdown/README.md` for architecture details
- Review Supabase docs: https://supabase.com/docs
- Check Expo docs: https://docs.expo.dev
- Review WatermelonDB docs: https://nozbe.github.io/WatermelonDB/

## Common Issues Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with Supabase credentials
- [ ] Supabase database schema set up (ran SQL script)
- [ ] Supabase RLS policies enabled
- [ ] Expo server running (`npm start`)
- [ ] App opens without errors
- [ ] Can create an account
- [ ] Can log in
- [ ] Can create tasks
- [ ] Data appears in Supabase dashboard

Good luck! 🚀
