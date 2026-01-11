import { Camera, CameraCategory } from './types';
import camerasRaw from './data/cameras.json';
import windyWebcamsRaw from './data/windy-webcams.json';

const YOUTUBE_CAMERAS: Camera[] = (camerasRaw as Omit<Camera, 'category' | 'source'>[]).map(cam => ({
  ...cam,
  source: 'youtube' as const,
  category: CameraCategory.LIVE
}));

const WINDY_CAMERAS: Camera[] = (windyWebcamsRaw as Camera[]).filter(cam => cam.enabled !== false);

export const ALL_CAMERAS: Camera[] = [...YOUTUBE_CAMERAS, ...WINDY_CAMERAS];

export const YOUTUBE_CAMERAS_ONLY = YOUTUBE_CAMERAS;

/**
 * Get all cameras (synchronous - loaded from static JSON files)
 * Windy webcams are synced via GitHub Actions and committed to the repo.
 */
export function getCameras(): Camera[] {
  return ALL_CAMERAS;
}

/**
 * Load cameras (async wrapper for compatibility)
 */
export async function loadCameras(): Promise<Camera[]> {
  return ALL_CAMERAS;
}

export const CAMERAS = YOUTUBE_CAMERAS_ONLY;
