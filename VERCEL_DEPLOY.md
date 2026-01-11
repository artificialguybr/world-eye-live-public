# Vercel Deployment Guide

This app uses Vercel Edge Functions to securely proxy requests to the Windy Webcam API, keeping your API key protected on the server side.

## Step 1: Deploy to Vercel

### Option A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to your Vercel account
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: world-eyemap (or your choice)
# - In which directory is your code located? ./
# - Override settings? Yes
```

### Option B: Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Click **Deploy**

## Step 2: Set Environment Variable

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Click **Add New** → Add `WINDY_API_KEY`
3. Paste your Windy API key (get it from [api.windy.com/keys](https://api.windy.com/keys))
4. Select the environments (Production, Preview, Development)
5. Click **Save**

### Or via Vercel CLI:

```bash
vercel env add WINDY_API_KEY
# Paste your API key when prompted
# Select the environments (all)
```

## Step 3: Re-deploy to Apply Environment Variables

After adding the environment variable, you need to redeploy:

```bash
vercel --prod
```

Or in the Vercel Dashboard:
- Go to **Deployments** → Click **Redeploy**

## Project Configuration (vercel.json)

The edge function configuration is already set up in the project. Vercel will automatically detect:

- `api/windy.ts` → Available at `https://your-project.vercel.app/api/windy`

## Environment Variables Reference

| Variable | Use | Exposure |
|----------|-----|----------|
| `WINDY_API_KEY` | Windy API key (server-side) | ✅ Protected (server only) |
| ~~`VITE_WINDY_API_KEY`~~ | ❌ DEPRECATED - Don't use this | ❌ Exposed to browser |

## Caching Strategy

The edge function returns cache headers to reduce API calls:

```
Cache-Control: public, max-age=600, s-maxage=600
```

- **cache**: 10 minutes
- **Free tier**: 1M Edge Function invocations/month
- **Estimated cost for 5,000 users/month**: $0

## Troubleshooting

### API Key Not Working

1. Check that the env var is named `WINDY_API_KEY` (without `VITE_` prefix)
2. Make sure you redeployed after adding the env var
3. Verify your API key is active at [api.windy.com/keys](https://api.windy.com/keys)

### Edge Function Not Found

Make sure the file is at `api/windy.ts` (not `api/windy/index.ts`).

### API Returns 500 Error

Check Vercel logs:
```bash
vercel logs
```

## Deploy Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# View environment variables
vercel env ls
```

## Monitor Usage

Check your usage in Vercel dashboard:
- Go to **Settings** → **Usage**
- Monitor:
  - Edge Requests (limit: 1M/month free)
  - Bandwidth (limit: 100GB/month free)

---

For more information:
- [Vercel Edge Functions Docs](https://vercel.com/docs/functions/edge-functions)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
