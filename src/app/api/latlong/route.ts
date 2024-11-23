// src/app/api/latlong/route.ts
import { getLatLong } from '@/app/lib/services/latLongService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const latLong = getLatLong();
    return NextResponse.json(latLong);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load lat/long data' }, { status: 500 });
  }
}