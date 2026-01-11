/**
 * Windy Webcams Sync via map/clusters tiling
 * - Recursively splits tiles when clusterSize > 1
 * - Collects unique webcams with location data for map pins
 * - Free-tier friendly, but request count can grow quickly
 */

import { CameraCategory } from '../types';

const WINDY_API_BASE = 'https://api.windy.com';
const INCLUDE_FIELDS = 'location';
const DEFAULT_MAX_ZOOM = 7;
const DEFAULT_MIN_ZOOM = 4;
const DEFAULT_LAT_MAX = 85;
const DEFAULT_LAT_MIN = -85;
const DEFAULT_LON_MAX = 180;
const DEFAULT_LON_MIN = -180;
const REQUEST_DELAY_MS = 150;
const MAX_REQUESTS = 3000;

interface ClusterWebcam {
  webcamId: number;
  title: string;
  viewCount: number;
  status: string;
  lastUpdatedOn: string;
  clusterSize: number;
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

type Tile = {
  northLat: number;
  southLat: number;
  westLon: number;
  eastLon: number;
  zoom: number;
};

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const entry = process.argv.find(arg => arg.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : undefined;
}

function getNumberArg(name: string, fallback: number): number {
  const value = getArg(name);
  if (!value) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function maxSpanForZoom(zoom: number, fullSpan: number): number {
  return fullSpan / Math.pow(2, zoom - 1);
}

async function fetchClusters(apiKey: string, tile: Tile): Promise<ClusterWebcam[]> {
  const params = new URLSearchParams({
    northLat: tile.northLat.toString(),
    southLat: tile.southLat.toString(),
    westLon: tile.westLon.toString(),
    eastLon: tile.eastLon.toString(),
    zoom: tile.zoom.toString(),
    include: INCLUDE_FIELDS,
  });

  const url = `${WINDY_API_BASE}/webcams/api/v3/map/clusters?${params.toString()}`;
  const response = await fetch(url, {
    headers: { 'x-windy-api-key': apiKey },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
  }

  return response.json();
}

function convertToExport(windy: ClusterWebcam): WindyExport {
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

function splitTile(tile: Tile): Tile[] {
  const midLat = (tile.northLat + tile.southLat) / 2;
  const midLon = (tile.westLon + tile.eastLon) / 2;
  const nextZoom = tile.zoom + 1;

  return [
    { northLat: tile.northLat, southLat: midLat, westLon: tile.westLon, eastLon: midLon, zoom: nextZoom },
    { northLat: tile.northLat, southLat: midLat, westLon: midLon, eastLon: tile.eastLon, zoom: nextZoom },
    { northLat: midLat, southLat: tile.southLat, westLon: tile.westLon, eastLon: midLon, zoom: nextZoom },
    { northLat: midLat, southLat: tile.southLat, westLon: midLon, eastLon: tile.eastLon, zoom: nextZoom },
  ];
}

function buildInitialTiles(minZoom: number, northLat: number, southLat: number, westLon: number, eastLon: number): Tile[] {
  const latSpan = maxSpanForZoom(minZoom, 180);
  const lonSpan = maxSpanForZoom(minZoom, 360);
  const tiles: Tile[] = [];

  for (let lat = northLat; lat > southLat; lat -= latSpan) {
    const south = Math.max(lat - latSpan, southLat);
    for (let lon = westLon; lon < eastLon; lon += lonSpan) {
      const east = Math.min(lon + lonSpan, eastLon);
      tiles.push({
        northLat: lat,
        southLat: south,
        westLon: lon,
        eastLon: east,
        zoom: minZoom,
      });
    }
  }

  return tiles;
}

async function main() {
  const apiKey = process.env.WINDY_API_KEY;
  if (!apiKey) {
    console.error('❌ WINDY_API_KEY environment variable is required');
    process.exit(1);
  }

  const maxZoom = getNumberArg('maxZoom', DEFAULT_MAX_ZOOM);
  const minZoom = getNumberArg('minZoom', DEFAULT_MIN_ZOOM);
  const maxRequests = getNumberArg('maxRequests', MAX_REQUESTS);
  const outputFile = getArg('output') || 'data/windy-webcams-tiles.json';

  const northLat = clamp(getNumberArg('northLat', DEFAULT_LAT_MAX), -90, 90);
  const southLat = clamp(getNumberArg('southLat', DEFAULT_LAT_MIN), -90, 90);
  const westLon = clamp(getNumberArg('westLon', DEFAULT_LON_MIN), -180, 180);
  const eastLon = clamp(getNumberArg('eastLon', DEFAULT_LON_MAX), -180, 180);

  console.log('🌍 Windy Tile Sync Started');
  console.log(`• Bounds: lat ${southLat}..${northLat}, lon ${westLon}..${eastLon}`);
  console.log(`• Zoom range: ${minZoom} → ${maxZoom}`);
  console.log(`• Max requests: ${maxRequests}`);

  const queue = buildInitialTiles(minZoom, northLat, southLat, westLon, eastLon);
  const webcams = new Map<string, WindyExport>();
  let requestCount = 0;

  while (queue.length) {
    if (requestCount >= maxRequests) {
      console.warn(`⚠️  Max requests (${maxRequests}) reached. Stopping early.`);
      break;
    }

    const tile = queue.shift()!;
    requestCount += 1;

    try {
      const clusters = await fetchClusters(apiKey, tile);
      const shouldSplit = clusters.some(cam => cam.clusterSize > 1);

      if (shouldSplit && tile.zoom < maxZoom) {
        queue.push(...splitTile(tile));
      } else {
        for (const cam of clusters) {
          const exported = convertToExport(cam);
          if (Number.isFinite(exported.coordinates.lat) && Number.isFinite(exported.coordinates.lng)) {
            webcams.set(exported.id, exported);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Tile error (zoom ${tile.zoom}):`, error);
    }

    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS));
  }

  const exported = Array.from(webcams.values());
  console.log(`✅ Tiles processed: ${requestCount}`);
  console.log(`✅ Unique webcams collected: ${exported.length}`);

  const fs = await import('fs');
  const path = await import('path');
  const outputPath = path.join(process.cwd(), outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(exported, null, 2));
  console.log(`📄 File: ${outputPath}`);
}

main();
