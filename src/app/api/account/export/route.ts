import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [projects, communityPosts, auditLogs, orders] = await Promise.all([
    prisma.project.findMany({ where: { ownerUserId: user.id } }),
    prisma.communityPost.findMany({ where: { authorUserId: user.id } }),
    prisma.auditLog.findMany({ where: { actorUserId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.storeOrder.findMany({ where: { userId: user.id } }),
  ]);

  const accountSummary = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    display_name: user.displayName,
    role: user.role,
    accountType: user.accountType,
    account_type: user.accountType,
    plan: user.plan,
    creditsAllowance: user.creditsAllowance,
    credits_allowance: user.creditsAllowance,
    creditsUsed: user.creditsUsed,
    credits_used: user.creditsUsed,
    creditsPurchased: user.creditsPurchased,
    credits_purchased: user.creditsPurchased,
    createdAt: user.createdAt.toISOString(),
    created_at: user.createdAt.toISOString(),
  };

  const payload = {
    exported_at: new Date().toISOString(),
    user: accountSummary,
    account: accountSummary,
    projects,
    community_posts: communityPosts,
    orders,
    audit_logs: auditLogs,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="atech-account-export-${user.id}.json"`,
    },
  });
}
