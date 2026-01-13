# Hosting Guide for Ruff Planner

This guide covers free hosting options for your Expo web app with upgrade paths.

## App Structure

Your app is an Expo app with:
- **Web support** (React Native Web) - can be deployed as static site
- **Backend**: Supabase (already hosted separately)
- **Static output**: Configured in `app.json` (`"output": "static"`)

## Free Hosting Options (Best to Least Recommended)

### 1. **Vercel** ⭐ (Recommended)

**Free Tier:**
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ 100GB bandwidth/month
- ✅ Custom domains
- ✅ Preview deployments
- ✅ Zero configuration for static sites

**Upgrade Options:**
- Pro: $20/month - More bandwidth, team features, analytics

**Deployment Steps:**
```bash
# Install Vercel CLI (optional, can use GitHub integration)
npm i -g vercel

# Build the web app
npx expo export:web

# Deploy (first time will ask to login)
cd web-build
vercel

# Or connect GitHub repo for auto-deploy
```

**GitHub Integration:**
1. Push code to GitHub
2. Go to vercel.com, click "New Project"
3. Import your GitHub repo
4. Build command: `npx expo export:web`
5. Output directory: `web-build`
6. Deploy!

---

### 2. **Netlify** ⭐ (Great Alternative)

**Free Tier:**
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ Form handling
- ✅ Serverless functions

**Upgrade Options:**
- Pro: $19/month - More bandwidth, team features

**Deployment Steps:**
```bash
# Build
npx expo export:web

# Deploy (first time)
npm i -g netlify-cli
cd web-build
netlify deploy --prod
```

**GitHub Integration:**
1. Push to GitHub
2. Go to netlify.com, click "New site from Git"
3. Connect GitHub repo
4. Build command: `npx expo export:web`
5. Publish directory: `web-build`

---

### 3. **Cloudflare Pages** ✅ (You Asked About This!)

**Free Tier:**
- ✅ Unlimited builds
- ✅ Unlimited bandwidth (yes, really!)
- ✅ Automatic SSL
- ✅ Global CDN (Cloudflare network)
- ✅ Custom domains
- ✅ Preview deployments
- ✅ 500 builds/month

**Upgrade Options:**
- Business: $20/month - More features, analytics, image optimization

**Deployment Steps:**
```bash
# Build
npx expo export:web

# Option 1: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Connect Git → Select your repo
4. Build settings:
   - Build command: npx expo export:web
   - Build output directory: web-build
   - Root directory: (leave empty)
5. Deploy!

# Option 2: Wrangler CLI
npm i -g wrangler
cd web-build
wrangler pages deploy .
```

**Pros:**
- ✅ Best free bandwidth (unlimited!)
- ✅ Excellent performance (Cloudflare CDN)
- ✅ Great for global audience

**Cons:**
- ⚠️ Less user-friendly dashboard than Vercel/Netlify
- ⚠️ Fewer integrations

---

### 4. **GitHub Pages** (Free but Limited)

**Free Tier:**
- ✅ Free for public repos
- ✅ 1GB storage
- ✅ 100GB bandwidth/month
- ✅ Custom domains
- ✅ Automatic SSL (via Cloudflare)

**Limitations:**
- ⚠️ Only works for public repos (or GitHub Pro)
- ⚠️ No serverless functions
- ⚠️ Manual deployment process

**Deployment:**
```bash
# Build
npx expo export:web

# Push to gh-pages branch
cd web-build
git init
git add .
git commit -m "Deploy"
git branch -M gh-pages
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin gh-pages

# Enable in GitHub repo Settings → Pages
```

---

### 5. **Render** (Free Tier Available)

**Free Tier:**
- ✅ 750 hours/month (enough for 1 always-on service)
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ Preview deployments

**Upgrade:**
- Starter: $7/month per service

---

### 6. **Railway** (Free Trial, Then Paid)

**Free Trial:**
- ✅ $5 free credit/month
- ⚠️ Charges after credit runs out
- ✅ Very easy deployment

**Best For:** Quick prototyping (not long-term free hosting)

---

## Comparison Table

| Platform | Free Bandwidth | Free Builds | Ease of Use | Best For |
|----------|---------------|-------------|-------------|----------|
| **Vercel** | 100GB/month | Unlimited | ⭐⭐⭐⭐⭐ | Most users |
| **Netlify** | 100GB/month | 300 min/month | ⭐⭐⭐⭐⭐ | Most users |
| **Cloudflare Pages** | **Unlimited** | 500/month | ⭐⭐⭐⭐ | High traffic |
| **GitHub Pages** | 100GB/month | Manual | ⭐⭐⭐ | Simple sites |
| **Render** | Limited | 750 hrs/month | ⭐⭐⭐⭐ | Apps needing backend |

## Recommendation

**For Development/Testing:**
1. **Vercel** or **Netlify** (easiest setup, great DX)
2. **Cloudflare Pages** (if you want unlimited bandwidth)

**For Production (when ready):**
- **Cloudflare Pages** if you need unlimited bandwidth
- **Vercel Pro** ($20/mo) if you need team features
- **Netlify Pro** ($19/mo) if you prefer their ecosystem

## Setup Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "build:web": "expo export:web",
    "deploy:vercel": "expo export:web && cd web-build && vercel --prod",
    "deploy:netlify": "expo export:web && cd web-build && netlify deploy --prod",
    "deploy:cloudflare": "expo export:web && cd web-build && wrangler pages deploy ."
  }
}
```

## Environment Variables

For all platforms, set these environment variables in their dashboards:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

These are public variables (safe to expose) that your app needs at build time.

## Mobile App Deployment

For mobile apps (iOS/Android), you'll use:
- **Expo EAS Build** (free tier available, then paid)
- Or build locally and submit to App Store/Play Store

But for web hosting, the above options are perfect!

## Next Steps

1. **Choose a platform** (I recommend starting with Vercel or Cloudflare Pages)
2. **Build your app**: `npx expo export:web`
3. **Deploy** using one of the methods above
4. **Set environment variables** in the platform dashboard
5. **Test** your deployed app
6. **Add custom domain** (optional, all platforms support this)

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- Expo Web Deployment: https://docs.expo.dev/distribution/publishing-websites/
