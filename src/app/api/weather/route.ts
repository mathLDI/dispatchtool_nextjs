import { NextResponse } from 'next/server';
import { getWeather } from '@/app/lib/services/weatherService';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const forceRefresh = url.searchParams.get('force') === 'true';
    
    if (!code) {
      return NextResponse.json({ error: 'code query param required' }, { status: 400 });
    }

    const data = await getWeather(code.toUpperCase(), { 
      includeMetar: true, 
      includeTaf: true, 
      includeNotam: true,
      forceRefresh // Pass force refresh flag
    });
    
    // Add cache control headers to ensure fresh data
    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (err: any) {
    console.error('API /api/weather error:', err);
    return NextResponse.json({ error: err?.message || 'unknown error' }, { status: 500 });
  }
}
