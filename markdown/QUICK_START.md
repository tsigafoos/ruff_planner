# Quick Start Checklist

Follow these steps in order to get BarkItDone running:

## ✅ Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

## ✅ Step 2: Set Up Supabase (10 minutes)

### A. Create Supabase Account
1. Go to https://supabase.com
2. Sign up (free account is fine)
3. Click "New Project"
4. Name it "BarkItDone" (or whatever you want)
5. Set a database password (SAVE THIS!)
6. Choose a region
7. Wait ~2 minutes for project to be created

### B. Get Your API Keys
1. In Supabase dashboard → **Settings** (⚙️) → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### C. Create Environment File
1. Create a file named `.env` in the project root
2. Add these lines (replace with YOUR values):
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### D. Set Up Database
1. In Supabase dashboard → **SQL Editor**
2. Click **New Query**
3. Open the file `sql/supabase-setup.sql` from this project
4. Copy ALL the SQL code
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" ✅

## ✅ Step 3: Start the App (1 minute)

```bash
npm start
```

This will:
- Start the Expo server
- Open your browser with Expo DevTools
- Show a QR code

## ✅ Step 4: Run on Your Device

**Option 1: Use Your Phone (Easiest)**
- Install "Expo Go" app from App Store (iOS) or Google Play (Android)
- Scan the QR code with:
  - **iOS**: Use the Camera app
  - **Android**: Use the Expo Go app

**Option 2: Use Simulator**
```bash
# iOS (macOS only)
npm run ios

# Android (need Android Studio)
npm run android

# Web browser
npm run web
```

## ✅ Step 5: Test the App (5 minutes)

1. **Create Account**
   - You'll see the login screen
   - Tap "Don't have an account? Sign up"
   - Enter email and password
   - Tap "Sign Up"

2. **Create Your First Task**
   - You should now be in the "Inbox" tab
   - Type a task in the box at the bottom
   - Tap the + button or press Enter
   - Your task should appear! ✅

3. **Create a Project**
   - Go to "Projects" tab
   - Tap "+ New Project"
   - Enter a name, pick a color
   - Tap "Create"

4. **Verify Sync Works**
   - Go to Supabase dashboard
   - Navigate to **Table Editor** → `tasks` table
   - You should see your task there! ✅

## 🎉 You're Done!

The app is now running. You can:
- Create tasks, projects, and labels
- Mark tasks as complete
- Everything saves locally (works offline!)
- Data syncs to Supabase when online

## 🐛 Having Issues?

See `markdown/SETUP_GUIDE.md` for detailed troubleshooting.

## Common Problems

**"Invalid login credentials"**
- Make sure you created an account first (Sign up, not Sign in)

**"Table doesn't exist"**
- You need to run the SQL script in Supabase SQL Editor

**App won't start**
- Try: `npm install` again
- Try: Clear cache with `npx expo start -c`

**Can't connect to Supabase**
- Check your `.env` file has the correct URL and key
- Make sure there are no extra spaces or quotes

---

**Next Steps**: Check out `markdown/SETUP_GUIDE.md` for more details and `markdown/README.md` for architecture info.
