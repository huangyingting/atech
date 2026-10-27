import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { listAuditLogs } from '@/lib/audit';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action') || undefined;
  const targetType = url.searchParams.get('targetType') || undefined;
  const limit = Number(url.searchParams.get('limit')) || 150;

  const logs = await listAuditLogs({ action, targetType, limit });
  return NextResponse.json({ logs });
}
