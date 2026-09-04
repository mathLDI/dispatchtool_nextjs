import { NextResponse } from 'next/server';
import { getWeather } from '@/app/lib/services/weatherService';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const forceRefresh = url.searchParams.get('force') === 'true';
    
    if (!code) {
      return NextResponse.json({ error: 'code query param required' }, { status: 400 });
    }

    const normalizedCode = code.toUpperCase();
    if (!/^[A-Z0-9]{4}$/.test(normalizedCode)) {
      return NextResponse.json({ error: 'code must be a four-character ICAO code' }, { status: 400 });
    }

    const data = await getWeather(normalizedCode, {
      includeMetar: true, 
      includeTaf: true, 
      includeNotam: true,
      forceRefresh // Pass force refresh flag
    });
    
    const response = NextResponse.json(data);
    if (forceRefresh) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    }
    
    return response;
  } catch (err: any) {
    console.error('API /api/weather error:', err);
    return NextResponse.json({ error: err?.message || 'unknown error' }, { status: 500 });
  }
}
