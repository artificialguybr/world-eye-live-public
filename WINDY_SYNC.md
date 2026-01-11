# Windy Webcams Sync System

## Overview

This project implements a lightweight caching system for Windy webcam metadata (location + coordinates) so we can render map pins without calling the API at runtime. Full details (player + images) are fetched on-demand when a user clicks a webcam.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ GitHub Actions (3x daily)                           │
│ └─→ Fetches up to 1,000 webcams via Windy API       │
│      • 20 requests total (50 per page)              │
│      • Free tier-friendly                           │
│ └─→ Generates JSON with map data                    │
│      • Location (city, country, coordinates)        │
│      • Enable/disable toggle flag                   │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ data/windy-webcams.json                             │
│ └─→ Committed to repository                        │
│      • Stats: ~8.5MB JSON file                      │
│      • Updated by GitHub Actions                     │
│      • Git diff shows changes only                  │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ App Runtime (On-demand details)                     │
│ └─→ Static JSON for pins + on-click fetch           │
│      • Instant map load                             │
│      • No API keys exposed to browser               │
│      • Player/images fetched only when needed       │
└─────────────────────────────────────────────────────┘
```

## Sync Process

### Frequency
- **3 times per day** (00:00, 08:00, 16:00 UTC)
- Total: **20 requests/day** = **600 requests/month**
- Uses a tiny fraction of free tier

### What Gets Synced

| Data Field | Source | Notes |
|------------|--------|-------|
| Location | Windy API | City, country, region |
| Coordinates | Windy API | Lat, lng for map display |
| Thumbnails | On-demand | Fetched when user clicks |
| Player URLs | On-demand | Fetched when user clicks |
| Status | Windy API | Active/inactive |
| Enable flag | Preserved | Carried over from previous sync |

### File Structure

```json
[
  {
    "id": "windy-12345",
    "name": "Camera Name",
    "location": "City, Country",
    "description": "Live webcam from City, Country",
    "coordinates": {
      "lat": 0.00,
      "lng": 0.00
    },
    "source": "windy",
    "windyId": "12345",
    "enabled": true,
    "lastUpdated": "2026-01-11T..."
  }
]
```

## Running the Sync

### Automated (GitHub Actions)

The sync runs automatically 3x per day via GitHub Actions.

#### Secrets Required

Add `WINDY_API_KEY` to GitHub repository secrets:
1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `WINDY_API_KEY`
4. Value: Your Windy API key
5. Click **Add secret**

### Manual Sync

Run the sync script locally:

```bash
# Set your API key
export WINDY_API_KEY=your_key_here

# Run the sync
npm run sync-windy
```

The script will:
1. Fetch up to 1,000 webcams from Windy API (paginated)
2. Convert to our format
3. Enable/disable webcams (if in manual control)
4. Only commit if there are changes detected

### Manual Trigger via GitHub UI

1. Go to **Actions** tab
2. Click on "Sync Windy Webcams" workflow
3. Click "Run workflow" dropdown
4. Optionally check "Force sync" to commit even if no changes
5. Click "Run workflow"

## Enable/Disable Webcams

To manually enable or disable specific webcams:

1. Open `data/windy-webcams.json`
2. Find the webcam by ID
3. Set `"enabled": false` to disable
4. Commit the change

**Note:** The sync script preserves the `enabled` flag across updates, so disabled cameras stay disabled.

## Benefits

### 🚀 Performance
- **Instant map load** - no network latency for webcam pins
- **CDN-cached** - static files cached by Vercel CDN

### 💰 Cost
- **~600 reqs/month** → tiny fraction of free tier
- **No runtime costs** for map pins
- **Only on-demand details use API**

### 🔒 Security
- **No API keys in browser** - keys only in GitHub Actions
- **Edge Function only for on-demand fetch**

### 📊 Reliability
- **Git version control** - track all changes
- **Diff-friendly** - easy to review what changed
- **Rollback** - easy to revert problematic changes

## Troubleshooting

### Sync fails with "HTTP 401"

Your API key is invalid or expired. Check at [api.windy.com/keys](https://api.windy.com/keys).

### Webcams not showing up

Check the console for JSON parse errors or verify `enabled: true` field.

### GitHub Actions not committing

Check:
1. Actions has permission to write to repo (Settings → Actions → General → Workflow permissions)
2. WINDY_API_KEY secret is set correctly

### Stats showing outdated numbers

The JSON might have a [skip ci] in commit. Trigger a manual sync to force an update.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Script Runner**: tsx (fast TypeScript execution)
- **Scheduler**: GitHub Actions (cron jobs)
- **Storage**: Git repository (version-controlled JSON)
