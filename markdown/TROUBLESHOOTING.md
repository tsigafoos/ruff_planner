# Troubleshooting Guide

## Email Confirmation Issues

### Problem: Confirmation email link goes to localhost

**Solution 1: Disable Email Confirmation (Easiest for Development)**
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Sign In / Providers**
3. Find "Enable email confirmations" (or email verification setting)
4. Turn it OFF
5. Click "Save"
6. Now you can sign in immediately after creating an account

**Solution 2: Configure Redirect URLs**
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to "Redirect URLs":
   - `exp://localhost:8081`
   - `ruffplanner://`
   - `http://localhost:8081`
3. Save

### Problem: Can't sign in after creating account

- Make sure email confirmation is disabled (for development)
- Or verify your email first
- Check that you're using the correct email and password

## Database Errors

### Problem: "Table doesn't exist"
- Make sure you ran the `sql/supabase-setup.sql` script
- Check Supabase dashboard → Table Editor to see if tables exist

### Problem: "Permission denied"
- Check that Row Level Security (RLS) policies are enabled
- Make sure you ran the complete SQL script including the policies

## App Won't Start

### Problem: WatermelonDB errors
- Clear cache: `npx expo start --clear`
- Make sure all dependencies are installed: `npm install`

### Problem: Route warnings
- These are usually false positives from caching
- Try: `npx expo start --clear`

## Sync Not Working

### Problem: Data doesn't sync to Supabase
- Check your `.env` file has correct Supabase credentials
- Verify you're signed in (check auth state)
- Check browser console for errors
- Make sure database tables exist and RLS policies are set

### Problem: "Network request failed"
- Check your internet connection
- Verify Supabase URL and key are correct
- Check Supabase project is active (not paused)

## Authentication Issues

### Problem: "Invalid login credentials"
- Make sure you created an account first (Sign up, not Sign in)
- Check email and password are correct
- If email confirmation is enabled, verify your email first

### Problem: Session not persisting
- This is normal - Supabase sessions persist in localStorage (web) or AsyncStorage (mobile)
- Try signing in again

## Common Fixes

1. **Clear cache and restart**:
   ```bash
   npx expo start --clear
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Reset database** (if needed):
   - In Supabase dashboard, you can drop and recreate tables
   - Or use the SQL script again

4. **Check environment variables**:
   - Make sure `.env` file exists
   - Verify values are correct (no extra spaces or quotes)
   - Restart Expo server after changing `.env`
