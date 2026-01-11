const WINDY_API_BASE = 'https://api.windy.com';
const WINDY_API_KEY = process.env.WINDY_API_KEY;

export const config = {
  runtime: 'edge',
};

export interface BoundingBox {
  west?: string | number;
  north?: string | number;
  east?: string | number;
  south?: string | number;
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
  } | {
    webcam: WindyWebcam;
  };
}

/**
 * GET /api/windy
 * Fetch webcams from Windy API (protected by server-side API key)
 *
 * Query params:
 * - id: Fetch single webcam by ID
 * - west, north, east, south: Bounding box for filtering
 */
export default async function handler(request: Request) {
  try {
    if (!WINDY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'WINDY_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const webcamId = searchParams.get('id');
    const west = searchParams.get('west');
    const north = searchParams.get('north');
    const east = searchParams.get('east');
    const south = searchParams.get('south');
    const include = searchParams.get('include');

    // Build Windy API URL
    let windyUrl: string;

    if (webcamId) {
      windyUrl = `${WINDY_API_BASE}/webcams/api/v3/webcams/${webcamId}`;
      const params = new URLSearchParams();
      if (include) params.append('include', include);
      if (params.toString()) {
        windyUrl += `?${params.toString()}`;
      }
    } else {
      windyUrl = `${WINDY_API_BASE}/webcams/api/v3/webcams`;

      const params = new URLSearchParams();
      if (west) params.append('west', west);
      if (north) params.append('north', north);
      if (east) params.append('east', east);
      if (south) params.append('south', south);
      if (include) params.append('include', include);

      if (params.toString()) {
        windyUrl += `?${params.toString()}`;
      }
    }

    // Fetch from Windy API
    const response = await fetch(windyUrl, {
      headers: {
        'x-windy-api-key': WINDY_API_KEY,
      },
    });

    if (!response.ok) {
      console.error('Windy API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from Windy API' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data: WindyApiResponse = await response.json();

    // Cache headers (10 min for free tier)
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600, s-maxage=600',
      },
    });
  } catch (error) {
    console.error('Error in Windy proxy:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET /api/windy/all-webcams
 * Fetch ALL webcams from Windy API with long cache (4 hours)
 */
export async function GET(request: Request) {
  try {
    if (!WINDY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'WINDY_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';

    // Route to different endpoints
    if (path === 'all-webcams') {
      return fetchAllWebcams();
    }

    // Default behavior (for backward compatibility)
    return handler(request);
  } catch (error) {
    console.error('Error in Windy proxy:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Fetch all webcams with extended cache (4 hours)
 * Note: Using /webcams/api/v3/webcams without filters to get all webcams with full data
 */
async function fetchAllWebcams() {
  try {
    // Use Windy's main API endpoint without filters to get all webcams
    // The export endpoint only has basic data (no location, thumbnails, or player URLs)
    const response = await fetch(`${WINDY_API_BASE}/webcams/api/v3/webcams`, {
      headers: {
        'x-windy-api-key': WINDY_API_KEY,
      },
    });

    if (!response.ok) {
      console.error('Windy all-webcams error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch all webcams from Windy' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    // Extended cache: 4 hours (14400 seconds)
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=14400, s-maxage=14400',
        'X-Cache-For': '4-hours',
      },
    });
  } catch (error) {
    console.error('Error fetching all webcams:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
