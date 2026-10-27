import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

const PLAN_ALLOWANCES: Record<string, number> = {
  free: 2000,
  standard: 10000,
  pro: 40000,
  max: 250000,
};

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (typeof body.plan === 'string' && body.plan in PLAN_ALLOWANCES) {
    data.plan = body.plan;
    data.creditsAllowance = PLAN_ALLOWANCES[body.plan];
  }
  const addAmount = typeof body.add_credits === 'number' ? body.add_credits : typeof body.amount === 'number' ? body.amount : 0;
  if (addAmount > 0) {
    data.creditsPurchased = user.creditsPurchased + Math.min(addAmount, 500000);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  await writeAuditLog({
    action: 'ACCOUNT_CREDITS_UPDATED',
    actorUserId: user.id,
    actorEmail: user.email,
    targetType: 'USER',
    targetId: user.id,
    metadata: data,
  });

  return NextResponse.json({
    ok: true,
    plan: updated.plan,
    credits_allowance: updated.creditsAllowance,
    credits_purchased: updated.creditsPurchased,
    credits_used: updated.creditsUsed,
    user: {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      avatarUrl: updated.avatarUrl,
      role: updated.role,
      status: updated.status,
      accountType: updated.accountType,
      plan: updated.plan,
      creditsAllowance: updated.creditsAllowance,
      creditsUsed: updated.creditsUsed,
      creditsPurchased: updated.creditsPurchased,
      themeMode: updated.themeMode,
      accentColor: updated.accentColor,
      analyticsConsent: updated.analyticsConsent,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}
