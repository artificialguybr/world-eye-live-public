import { Camera, CameraCategory } from './types';
import camerasRaw from './data/cameras.json';
import { fetchWebcams } from './lib/windy';

const YOUTUBE_CAMERAS: Camera[] = (camerasRaw as Omit<Camera, 'category' | 'source'>[]).map(cam => ({
  ...cam,
  source: 'youtube' as const,
  category: CameraCategory.LIVE
}));

export const YOUTUBE_CAMERAS_ONLY = YOUTUBE_CAMERAS;

let cachedCameras: Camera[] | null = null;

/**
 * Load cameras from both YouTube (static JSON) and Windy API (dynamic)
 * Returns a cached result and fetches in background for subsequent calls
 */
export async function loadCameras(): Promise<Camera[]> {
  if (cachedCameras) {
    return cachedCameras;
  }

  const windyCameras = await fetchWebcams();
  cachedCameras = [...YOUTUBE_CAMERAS, ...windyCameras];
  return cachedCameras;
}

export const CAMERAS = YOUTUBE_CAMERAS_ONLY;
