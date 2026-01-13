# How to Disable Email Confirmation in Supabase

## Method 1: Via Email Settings

1. Go to **Authentication** → **Email**
2. Look for a toggle or checkbox that says:
   - "Enable email confirmations"
   - "Require email confirmation"
   - "Confirm email"
3. Turn it OFF
4. Click **Save**

## Method 2: Via Configuration

1. Go to **Authentication** → **Configuration**
2. Look for email/verification settings
3. Find "Enable email confirmations" or similar
4. Turn it OFF
5. Click **Save**

## Method 3: Via Database (Advanced)

If you can't find the UI setting, you can also disable it via SQL:

```sql
-- This disables email confirmation requirement
-- Run this in Supabase SQL Editor
UPDATE auth.config 
SET enable_signup = true, 
    enable_email_confirmations = false;
```

**Note**: The exact SQL may vary depending on your Supabase version. Use the UI method if possible.

## What This Does

- Users can create accounts and sign in immediately
- No email verification required
- Perfect for development/testing
- You can re-enable it later for production

## Alternative: Just Sign In Anyway

Even with email confirmation enabled, you might still be able to sign in. Some Supabase projects allow unverified users to sign in, they just show a "Please verify your email" message.

Try just signing in with your credentials - it might work!
