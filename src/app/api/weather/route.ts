import { NextResponse } from 'next/server';
import { getWeather } from '@/app/lib/services/weatherService';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    if (!code) {
      return NextResponse.json({ error: 'code query param required' }, { status: 400 });
    }

    const data = await getWeather(code.toUpperCase(), { includeMetar: true, includeTaf: true, includeNotam: true });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API /api/weather error:', err);
    return NextResponse.json({ error: err?.message || 'unknown error' }, { status: 500 });
  }
}
