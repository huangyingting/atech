import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listAuditLogs } from '@/lib/audit';
import { getCatalogPayload } from '@/lib/studio-engine';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Administrator privileges required to access dashboard telemetry.' },
      { status: 403 }
    );
  }

  const [
    users,
    invites,
    projects,
    ratings,
    communityPosts,
    supportTickets,
    inquiries,
    orders,
    auditLogs,
  ] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.invitationCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, email: true, displayName: true } },
        redeemedUsers: { select: { id: true, email: true, displayName: true, role: true } },
      },
    }),
    prisma.project.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.projectTurnRating.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.communityPost.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.enterpriseInquiry.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.storeOrder.findMany({ orderBy: { createdAt: 'desc' } }),
    listAuditLogs({ limit: 150 }),
  ]);

  const catalog = getCatalogPayload();
  const totalCreditsSpent = users.reduce((sum, u) => sum + u.creditsUsed, 0);
  const activeInvitesCount = invites.filter((i) => !i.revokedAt && i.usedCount < i.maxUses).length;
  const openSupportCount = supportTickets.filter((t) => t.status === 'open').length;

  return NextResponse.json({
    metrics: {
      totalUsers: users.length,
      usersCount: users.length,
      activeUsers: users.filter((u) => u.status === 'ACTIVE').length,
      activeUsersCount: users.filter((u) => u.status === 'ACTIVE').length,
      revokedUsers: users.filter((u) => u.status === 'REVOKED').length,
      revokedUsersCount: users.filter((u) => u.status === 'REVOKED').length,
      totalInvites: invites.length,
      activeInvites: activeInvitesCount,
      activeInvitesCount,
      totalProjects: projects.length,
      projectsCount: projects.length,
      communityPosts: communityPosts.length,
      communityPostsCount: communityPosts.length,
      openTickets: openSupportCount,
      supportTicketsCount: openSupportCount,
      enterpriseInquiries: inquiries.length,
      inquiriesCount: inquiries.length,
      storeOrders: orders.length,
      ordersCount: orders.length,
      catalogPartsCount:
        catalog.modules.length + catalog.offtheshelf_boards.length + catalog.ky_modules.length,
    },
    recentUsers: users.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      status: u.status,
      accountType: u.accountType,
      plan: u.plan,
      creditsUsed: u.creditsUsed,
      creditsAllowance: u.creditsAllowance,
      creditsRemaining: Math.max(0, u.creditsAllowance + u.creditsPurchased - u.creditsUsed),
      sessionVersion: u.sessionVersion,
      createdAt: u.createdAt.toISOString(),
    })),
    recentInvites: invites.map((inv) => ({
      id: inv.id,
      code: inv.code,
      label: inv.label,
      emailHint: inv.emailHint,
      role: inv.assignedRole,
      assignedRole: inv.assignedRole,
      accountType: inv.assignedAccountType,
      maxUses: inv.maxUses,
      usedCount: inv.usedCount,
      expiresAt: inv.expiresAt.toISOString(),
      revokedAt: inv.revokedAt?.toISOString() || null,
      createdAt: inv.createdAt.toISOString(),
    })),
    recentAuditLogs: auditLogs,
    recentProjects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      boardId: p.boardId,
      currentPhase: p.currentPhase,
      ownerEmail: p.ownerEmail,
      writeSeq: p.writeSeq,
      updatedAt: p.updatedAt.toISOString(),
    })),
    kpis: {
      total_builds: projects.length,
      total_users: users.length,
      active_invites: activeInvitesCount,
      total_credits_spent: totalCreditsSpent,
      community_posts: communityPosts.length,
      open_support_tickets: openSupportCount,
      open_inquiries: inquiries.length,
      orders_count: orders.length,
    },
    builds: projects.map((p) => ({
      id: p.id,
      name: p.name,
      prompt: p.prompt.slice(0, 120),
      board: p.boardId,
      sourcing: p.sourcingMode,
      phase: p.currentPhase,
      write_seq: p.writeSeq,
      owner_email: p.ownerEmail || 'anonymous',
      featured: p.featured,
      starred: p.starred,
      updated_at: p.updatedAt.toISOString(),
    })),
    ratings: ratings.map((r) => ({
      id: r.id,
      project_id: r.projectId,
      job_id: r.jobId,
      rating: r.rating,
      comment: r.comment,
      created_at: r.createdAt.toISOString(),
    })),
    errors: auditLogs
      .filter((l) => l.action.includes('FAILED') || l.action.includes('REJECTED'))
      .map((l) => ({
        id: l.id,
        action: l.action,
        actor_email: l.actorEmail,
        metadata: l.metadata,
        created_at: l.createdAt,
      })),
    token_spend: users.map((u) => ({
      user_id: u.id,
      email: u.email,
      plan: u.plan,
      credits_used: u.creditsUsed,
      credits_allowance: u.creditsAllowance,
      credits_purchased: u.creditsPurchased,
    })),
    activity: auditLogs,
    modules_summary: {
      atech_modules: catalog.modules.length,
      offtheshelf_boards: catalog.offtheshelf_boards.length,
      ky_modules: catalog.ky_modules.length,
    },
    accounts: users.map((u) => ({
      id: u.id,
      email: u.email,
      display_name: u.displayName,
      role: u.role,
      account_type: u.accountType,
      status: u.status,
      plan: u.plan,
      credits_used: u.creditsUsed,
      credits_allowance: u.creditsAllowance,
      created_at: u.createdAt.toISOString(),
    })),
    invites: invites.map((inv) => ({
      id: inv.id,
      code: inv.code,
      label: inv.label,
      email_hint: inv.emailHint,
      assigned_role: inv.assignedRole,
      assigned_account_type: inv.assignedAccountType,
      max_uses: inv.maxUses,
      used_count: inv.usedCount,
      expires_at: inv.expiresAt.toISOString(),
      revoked_at: inv.revokedAt?.toISOString() || null,
      revoked_reason: inv.revokedReason,
      created_at: inv.createdAt.toISOString(),
      redeemed_users: inv.redeemedUsers,
    })),
    inquiries: inquiries.map((inq) => ({
      id: inq.id,
      vertical: inq.vertical,
      name: inq.name,
      email: inq.email,
      organization: inq.organization,
      quantity: inq.quantityEstimate,
      message: inq.message,
      status: inq.status,
      created_at: inq.createdAt.toISOString(),
    })),
    support: supportTickets.map((t) => ({
      id: t.id,
      email: t.email,
      subject: t.subject,
      page_url: t.pageUrl,
      project_id: t.projectId,
      message: t.message,
      status: t.status,
      created_at: t.createdAt.toISOString(),
    })),
    infrastructure: {
      status: 'healthy',
      database_engine: (process.env.DATABASE_URL || '').startsWith('postgres') ? 'PostgreSQL' : 'SQLite (WAL)',
      firmware_compiler: 'ESP-IDF v5.2 / Arduino-ESP32S3 Ready',
      websocket_gateway: 'Online (115200 baud JSON bridge)',
      uptime_seconds: Math.floor(process.uptime()),
    },
  });
}
