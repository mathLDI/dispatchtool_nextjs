// src/app/api/runways/route.ts
import { getRunways } from '@/app/lib/services/runwayService';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const airport = url.searchParams.get('airport')?.trim().toUpperCase();

    if (airport && !/^[A-Z0-9]{4}$/.test(airport)) {
      return NextResponse.json({ error: 'airport must be a four-character ICAO code' }, { status: 400 });
    }

    const runways = getRunways(airport);
    const response = NextResponse.json(runways);
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load runway data' }, { status: 500 });
  }
}