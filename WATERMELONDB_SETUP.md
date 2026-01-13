# WatermelonDB Setup for Expo

## The Problem

WatermelonDB requires native code and **doesn't work with Expo Go**. You need either:
- A custom development build, OR
- Test on web (which works!)

## Solution 1: Test on Web (Easiest - Try This First!)

WatermelonDB works on web! Try this:

```bash
npm run web
```

This will open the app in your browser where WatermelonDB should work.

## Solution 2: Create a Development Build (For Mobile Testing)

If you want to test on mobile devices, you need to create a custom development build.

### Option A: Using EAS Build (Recommended)

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS**:
   ```bash
   eas build:configure
   ```

4. **Install WatermelonDB Expo Plugin** (if available):
   ```bash
   npm install @morrowdigital/watermelondb-expo-plugin
   ```

5. **Update app.json** to include the plugin (if using the plugin)

6. **Build development client**:
   ```bash
   # For Android
   eas build --profile development --platform android
   
   # For iOS (requires Apple Developer account)
   eas build --profile development --platform ios
   ```

7. **Install the build on your device** and use it instead of Expo Go

### Option B: Use Expo Dev Client Locally (Alternative)

1. **Install expo-dev-client**:
   ```bash
   npx expo install expo-dev-client
   ```

2. **Prebuild** (creates native folders):
   ```bash
   npx expo prebuild
   ```

3. **Run locally**:
   ```bash
   # Android
   npx expo run:android
   
   # iOS (macOS only)
   npx expo run:ios
   ```

## Solution 3: Alternative Database (For Quick Testing)

If you just want to test the UI without the database complexity, we could temporarily use a simpler solution, but this would require code changes.

## Recommended: Start with Web!

The easiest solution is to test on web first:

```bash
npm run web
```

This should work immediately and let you test all the functionality!

## What Works Where

- ✅ **Web**: WatermelonDB works (SQLite via WebAssembly)
- ❌ **Expo Go (Mobile)**: WatermelonDB doesn't work (needs native code)
- ✅ **Development Build (Mobile)**: WatermelonDB works (after building)

Try web first, then we can set up a development build if you need mobile testing!
