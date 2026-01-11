const WINDY_API_BASE = 'https://api.windy.com';
const WINDY_API_KEY = process.env.WINDY_API_KEY;

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

    // Build Windy API URL
    let windyUrl: string;

    if (webcamId) {
      windyUrl = `${WINDY_API_BASE}/webcams/api/v3/webcams/${webcamId}`;
    } else {
      windyUrl = `${WINDY_API_BASE}/webcams/api/v3/webcams`;

      const params = new URLSearchParams();
      if (west) params.append('west', west);
      if (north) params.append('north', north);
      if (east) params.append('east', east);
      if (south) params.append('south', south);

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

export const config = {
  runtime: 'edge',
};
