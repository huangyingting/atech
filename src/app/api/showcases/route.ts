import { NextResponse } from 'next/server';
import { getShowcasesPayload } from '@/lib/studio-engine';

export async function GET() {
  return NextResponse.json(getShowcasesPayload());
}
