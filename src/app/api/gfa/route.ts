import { NextResponse } from 'next/server';
import { getGfaReleaseSlot } from '@/app/lib/services/gfaReleaseSlot';

export const dynamic = 'force-dynamic';

const GFA_TYPES = new Set(['CLDWX', 'TURBC']);
const gfaCache = new Map<string, { data: any; expiresAt: number }>();
const rawGfaCache = new Map<string, { data: any; expiresAt: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

async function fetchRawGfa(airportCode: string, releaseSlot: ReturnType<typeof getGfaReleaseSlot>) {
  const rawCacheKey = `${airportCode}:${releaseSlot.key}`;
  const cached = rawGfaCache.get(rawCacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  if (inFlightRequests.has(rawCacheKey)) {
    return inFlightRequests.get(rawCacheKey);
  }

  const apiUrl = `https://plan.navcanada.ca/weather/api/alpha/?site=${encodeURIComponent(airportCode)}&image=GFA/CLDWX&image=GFA/TURBC`;
  const request = fetch(apiUrl, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`NavCanada API returned ${response.status}`);
    }

    const data = await response.json();
    rawGfaCache.set(rawCacheKey, {
      data,
      expiresAt: releaseSlot.nextIssuedAt.getTime() + 15 * 60 * 1000,
    });
    return data;
  }).finally(() => {
    inFlightRequests.delete(rawCacheKey);
  });

  inFlightRequests.set(rawCacheKey, request);
  return request;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const gfaType = (url.searchParams.get('type') || 'CLDWX').toUpperCase();
    const airportCode = (url.searchParams.get('airport') || 'CYUL').toUpperCase();

    if (!GFA_TYPES.has(gfaType)) {
      return NextResponse.json({ error: 'type must be CLDWX or TURBC' }, { status: 400 });
    }

    if (!/^[A-Z0-9]{4}$/.test(airportCode)) {
      return NextResponse.json({ error: 'airport must be a four-character ICAO code' }, { status: 400 });
    }

    const releaseSlot = getGfaReleaseSlot();
    const cacheKey = `${airportCode}:${gfaType}:${releaseSlot.key}`;
    const cached = gfaCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      const response = NextResponse.json(cached.data);
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
      return response;
    }

    const apiData = await fetchRawGfa(airportCode, releaseSlot);

    const gfaItem = apiData.data?.find((item: any) => {
      try {
        const textData = JSON.parse(item.text);
        return textData.sub_product === gfaType;
      } catch {
        return false;
      }
    });

    if (!gfaItem) {
      console.warn(`[API GFA] No data found for type ${gfaType} at airport ${airportCode}`);
      return NextResponse.json({ error: `No GFA data available for ${gfaType}` }, { status: 404 });
    }

    // Parse the text field which contains the actual GFA data
    const textData = JSON.parse(gfaItem.text);
    
    const wrappedData = {
      data: [{
        type: 'gfa',
        text: JSON.stringify(textData)
      }],
      gfaType,
      releaseSlot: releaseSlot.key,
      fetchedAt: Date.now(),
    };

    gfaCache.set(cacheKey, {
      data: wrappedData,
      expiresAt: releaseSlot.nextIssuedAt.getTime() + 15 * 60 * 1000,
    });

    const responseData = NextResponse.json(wrappedData);
    responseData.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
    return responseData;
  } catch (err: any) {
    console.error('API /api/gfa error:', err);
    return NextResponse.json({ error: err?.message || 'unknown error' }, { status: 500 });
  }
}
