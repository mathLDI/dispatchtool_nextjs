// src/app/api/runways/route.ts
import { getRunways } from '@/app/lib/services/runwayService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const runways = getRunways();
    return NextResponse.json(runways);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load runway data' }, { status: 500 });
  }
}