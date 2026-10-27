import { NextResponse } from 'next/server';
import { getCatalogPayload } from '@/lib/studio-engine';

export async function GET() {
  return NextResponse.json(getCatalogPayload());
}
