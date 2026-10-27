import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'ping');
  const payload = body.payload || body;
  const nowIso = new Date().toISOString();

  let wifiConfig: {
    ssid?: string;
    gateway_open?: boolean;
    board_connected?: boolean;
    last_seen?: string | null;
    events_log?: { ts: string; dir: 'in' | 'out'; payload: Record<string, unknown> }[];
  } = {};

  try {
    wifiConfig = JSON.parse(project.wifiConfigJson || '{}');
  } catch {
    wifiConfig = {};
  }

  const responseEvent = {
    event: `${action}_ack`,
    action_received: action,
    ok: true,
    board_ts: Date.now(),
  };

  const log = Array.isArray(wifiConfig.events_log) ? wifiConfig.events_log.slice(-40) : [];
  log.push(
    { ts: nowIso, dir: 'out', payload: { action, ...payload } },
    { ts: nowIso, dir: 'in', payload: responseEvent }
  );

  const nextWifi = {
    ...wifiConfig,
    gateway_open: true,
    board_connected: true,
    last_seen: nowIso,
    events_log: log,
  };

  await prisma.project.update({
    where: { id },
    data: { wifiConfigJson: JSON.stringify(nextWifi) },
  });

  return NextResponse.json({
    ok: true,
    dispatched: { action, ...payload },
    device_response: responseEvent,
    events_log: log,
  });
}
