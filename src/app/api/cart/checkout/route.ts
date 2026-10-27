import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || user?.email || '').trim().toLowerCase();
  const shippingName = String(body.shippingName || body.name || '').trim();
  const countryCode = String(body.countryCode || 'US');
  const currency = String(body.currency || 'USD');
  const items = Array.isArray(body.items) ? body.items : [];

  if (!email) {
    return NextResponse.json({ error: 'Email address is required for order confirmation.' }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
  }

  const subtotalUsd = items.reduce(
    (sum: number, item: { priceUsd?: number; qty?: number }) =>
      sum + (Number(item.priceUsd) || 0) * Math.max(1, Number(item.qty) || 1),
    0
  );
  const shippingUsd = subtotalUsd >= 350 ? 0 : 18;
  const totalUsd = subtotalUsd + shippingUsd;

  const order = await prisma.storeOrder.create({
    data: {
      userId: user?.id || null,
      email,
      shippingName: shippingName || null,
      countryCode,
      currency,
      itemsJson: JSON.stringify(items),
      subtotalMinor: Math.round(subtotalUsd * 100),
      shippingMinor: Math.round(shippingUsd * 100),
      totalMinor: Math.round(totalUsd * 100),
      status: 'confirmed',
    },
  });

  await writeAuditLog({
    action: 'ORDER_CHECKOUT_CONFIRMED',
    actorUserId: user?.id || null,
    actorEmail: email,
    targetType: 'ORDER',
    targetId: order.id,
    metadata: { totalUsd, itemCount: items.length, countryCode, currency },
  });

  return NextResponse.json({
    ok: true,
    order_id: order.id,
    status: order.status,
    total_usd: totalUsd,
    created_at: order.createdAt.toISOString(),
  });
}
