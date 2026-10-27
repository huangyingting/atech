import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const creditsRemaining = Math.max(
    0,
    user.creditsAllowance + user.creditsPurchased - user.creditsUsed
  );
  return NextResponse.json({
    id: user.id,
    email: user.email,
    display_name: user.displayName,
    displayName: user.displayName,
    role: user.role,
    account_type: user.accountType,
    accountType: user.accountType,
    status: user.status,
    plan: user.plan,
    creditsRemaining,
    creditsMonthlyLimit: user.creditsAllowance,
    created_at: user.createdAt.toISOString(),
  });
}
