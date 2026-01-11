/**
 * Simple Windy Webcams Sync Script
 * Fetches webcams with location for map pins (free tier-friendly).
 * Images and players are fetched on-demand when the user clicks a webcam.
 */

import { CameraCategory } from '../types';

const WINDY_API_BASE = 'https://api.windy.com';
const MAX_WEBCAMS = 1000; // Free tier limit
const INCLUDE_FIELDS = 'location';

interface BasicWebcam {
  webcamId: string;
  title: string;
  viewCount: number;
  status: string;
  lastUpdatedOn: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface WindyExport {
  id: string;
  name: string;
  location: string;
  description: string;
  source: 'windy';
  windyId: string;
  category: CameraCategory;
  coordinates: {
    lat: number;
    lng: number;
  };
  enabled: boolean;
  lastUpdated: string;
}

async function fetchAllWebcams(apiKey: string): Promise<BasicWebcam[]> {
  const allWebcams: BasicWebcam[] = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;
  let total = 0;

  console.log(`🔄 Fetching Windy webcams (max ${MAX_WEBCAMS})...`);

  while (hasMore && allWebcams.length < MAX_WEBCAMS) {
    const url = `${WINDY_API_BASE}/webcams/api/v3/webcams?limit=${limit}&offset=${offset}&include=${INCLUDE_FIELDS}`;

    try {
      const response = await fetch(url, {
        headers: {
          'x-windy-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const webcams = data.result?.webcams || data.webcams;
      const totalCount = data.result?.total || data.total;

      if (!webcams) {
        console.error(`❌ Invalid response at offset ${offset}`);
        hasMore = false;
        break;
      }

      allWebcams.push(...webcams);
      total = totalCount || total;

      console.log(`  ✅ Fetched ${webcams.length} webcams (offset ${offset}/${total})`);

      hasMore = webcams.length >= limit;
      offset += limit;

      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Error at offset ${offset}:`, error);
      offset += limit;
      if (allWebcams.length === 0) {
        throw error;
      }
    }
  }

  console.log(`✅ Total webcams fetched: ${allWebcams.length}`);
  return allWebcams;
}

function convertToExport(windy: BasicWebcam): WindyExport {
  const location = windy.location;
  const city = location?.city?.trim();
  const country = location?.country?.trim();
  const locationLabel = [city, country].filter(Boolean).join(', ') || 'Unknown';
  const lat = typeof location?.latitude === 'number' ? location.latitude : Number.NaN;
  const lng = typeof location?.longitude === 'number' ? location.longitude : Number.NaN;

  return {
    id: `windy-${windy.webcamId}`,
    name: windy.title,
    location: locationLabel,
    description: `Live webcam from ${locationLabel}`,
    source: 'windy' as const,
    windyId: String(windy.webcamId),
    category: CameraCategory.LIVE,
    coordinates: {
      lat,
      lng,
    },
    enabled: true,
    lastUpdated: new Date().toISOString(),
  };
}

function calculateHash(data: any): string {
  return JSON.stringify(data).length.toString();
}

function syncEnabledFlags(current: WindyExport[], previous: WindyExport[]): WindyExport[] {
  const previousMap = new Map(previous.map(c => [c.id, c.enabled]));
  return current.map(c => ({
    ...c,
    enabled: previousMap.get(c.id) ?? true,
  }));
}

async function main() {
  const apiKey = process.env.WINDY_API_KEY;

  if (!apiKey) {
    console.error('❌ WINDY_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🌍 Windy Webcam Sync Started');
  console.log('╔═════════════════════════════════════╗');
  console.log('║  Syncing Windy webcams (free tier)  ║');
  console.log('╚═════════════════════════════════════╝');

  try {
    const webcams = await fetchAllWebcams(apiKey);
    const exported = webcams
      .map(convertToExport)
      .filter(cam => Number.isFinite(cam.coordinates.lat) && Number.isFinite(cam.coordinates.lng));

    const fs = await import('fs');
    const path = await import('path');
    const outputPath = path.join(process.cwd(), 'data', 'windy-webcams.json');

    let previousWebcams: WindyExport[] = [];
    let previousHash = '';

    try {
      if (fs.existsSync(outputPath)) {
        const previousContent = fs.readFileSync(outputPath, 'utf-8');
        previousWebcams = JSON.parse(previousContent);
        previousHash = calculateHash(previousWebcams);
      }
    } catch (error) {
      console.log('📂 No previous sync data found');
    }

    console.log('🔄 Preserving enabled flags...');
    const finalData = syncEnabledFlags(exported, previousWebcams);
    const currentHash = calculateHash(finalData);

    if (currentHash === previousHash) {
      console.log('\n✅ No changes detected. Skipping sync.');
      console.log(`\n📊 Sync Summary:\n  • Total: ${finalData.length} webcams\n  • Enabled: ${finalData.filter(c => c.enabled).length}`);
      return;
    }

    console.log('💾 Writing to file...');
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

    console.log('\n✅ Sync completed successfully!');
    console.log(`\n📊 Sync Summary:\n  • Total webcams: ${finalData.length}`);
    console.log(`  • Added: ${finalData.length - previousWebcams.length}`);
    console.log(`  • Enabled: ${finalData.filter(c => c.enabled).length}`);
    console.log(`\n  📄 File: ${outputPath}`);

  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
