import { Camera, CameraCategory, CameraSource } from '../types';

export interface BoundingBox {
  minLat?: number;
  minLng?: number;
  maxLat?: number;
  maxLng?: number;
}

export interface WindyWebcam {
  webcamId: string;
  name: string;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  status: string;
  image: {
    current: {
      thumbnail: string;
      daylight: string;
    };
  };
  url: {
    player: {
      day: string;
      live: string;
    } | null;
  };
  categories?: string[];
}

export interface WindyApiResponse {
  result: {
    webcams: WindyWebcam[];
  };
}

/**
 * Get base URL for API (works in both dev and production)
 */
function getApiBaseUrl(): string {
  // In production, use relative path to current origin
  if (import.meta.env.PROD) {
    return '' + '/api/windy';
  }
  // In development, use local server
  return '/api/windy';
}

/**
 * Fetch webcams from our API proxy (which hides the Windy API key)
 */
export async function fetchWebcams(boundingBox?: BoundingBox): Promise<Camera[]> {
  try {
    const params = new URLSearchParams();
    if (boundingBox) {
      if (boundingBox.minLat !== undefined) params.append('south', boundingBox.minLat.toString());
      if (boundingBox.minLng !== undefined) params.append('west', boundingBox.minLng.toString());
      if (boundingBox.maxLat !== undefined) params.append('north', boundingBox.maxLat.toString());
      if (boundingBox.maxLng !== undefined) params.append('east', boundingBox.maxLng.toString());
    }

    const response = await fetch(
      `${getApiBaseUrl()}${params.toString() ? '?' + params.toString() : ''}`
    );

    if (!response.ok) {
      console.error('API proxy error:', response.status, response.statusText);
      return [];
    }

    const data: WindyApiResponse = await response.json();
    return data.result.webcams.map(windyWebcamToCamera);
  } catch (error) {
    console.error('Error fetching Windy webcams:', error);
    return [];
  }
}

/**
 * Fetch a single webcam by ID from our API proxy
 */
export async function fetchWebcamById(id: string): Promise<Camera | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}?id=${id}`);

    if (!response.ok) {
      console.error('API proxy error:', response.status, response.statusText);
      return null;
    }

    const data: { result: { webcam: WindyWebcam } } = await response.json();
    return windyWebcamToCamera(data.result.webcam);
  } catch (error) {
    console.error('Error fetching Windy webcam:', error);
    return null;
  }
}

/**
 * Fetch available webcam categories from Windy API
 */
export async function fetchCategories(): Promise<string[]> {
  if (!API_KEY) {
    console.warn('VITE_WINDY_API_KEY not set. Skipping Windy webcam integration.');
    return [];
  }

  try {
    const response = await fetch(`${WINDY_API_BASE}/webcams/api/v3/categories`, {
      headers: {
        'x-windy-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      console.error('Windy API error:', response.status, response.statusText);
      return [];
    }

    const data: { result: { categories: { id: string; name: string }[] } } = await response.json();
    return data.result.categories.map(cat => cat.name);
  } catch (error) {
    console.error('Error fetching Windy categories:', error);
    return [];
  }
}

/**
 * Convert Windy webcam data to our Camera interface
 */
function windyWebcamToCamera(windy: WindyWebcam): Camera {
  const category = mapWindyCategoryToCameraCategory(windy.categories);
  const location = windy.location ? 
    `${windy.location.city || ''}, ${windy.location.country || ''}`.trim() : 
    windy.name;

  return {
    id: `windy-${windy.webcamId}`,
    name: windy.name,
    location: location,
    description: `Live webcam from ${location}`,
    source: 'windy' as CameraSource,
    windyId: windy.webcamId,
    windyPlayerUrl: windy.url?.player?.live || windy.url?.player?.day || undefined,
    thumbnail: windy.image.current.thumbnail,
    category,
    coordinates: {
      lat: windy.location?.latitude || 0,
      lng: windy.location?.longitude || 0,
    },
  };
}

/**
 * Map Windy categories to our CameraCategory enum
 */
function mapWindyCategoryToCameraCategory(categories?: string[]): CameraCategory {
  if (!categories || categories.length === 0) {
    return CameraCategory.LIVE;
  }

  const categoryStr = categories[0].toLowerCase();

  if (categoryStr.includes('beach') || categoryStr.includes('water') || categoryStr.includes('ocean')) {
    return CameraCategory.BEACH;
  } else if (categoryStr.includes('nature') || categoryStr.includes('mountain') || categoryStr.includes('forest')) {
    return CameraCategory.NATURE;
  } else if (categoryStr.includes('traffic') || categoryStr.includes('road')) {
    return CameraCategory.TRAFFIC;
  } else if (categoryStr.includes('city') || categoryStr.includes('urban') || categoryStr.includes('skyline')) {
    return CameraCategory.CITY;
  } else if (categoryStr.includes('animal') || categoryStr.includes('bird') || categoryStr.includes('pet')) {
    return CameraCategory.ANIMAL;
  } else if (categoryStr.includes('space') || categoryStr.includes('sky') || categoryStr.includes('star')) {
    return CameraCategory.SPACE;
  }

  return CameraCategory.LIVE;
}
