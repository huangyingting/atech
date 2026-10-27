import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerUserId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      title: true,
      currentPhase: true,
      starred: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      accountType: user.accountType,
      plan: user.plan,
      creditsAllowance: user.creditsAllowance,
      creditsUsed: user.creditsUsed,
      creditsPurchased: user.creditsPurchased,
      themeMode: user.themeMode,
      accentColor: user.accentColor,
      analyticsConsent: user.analyticsConsent,
      createdAt: user.createdAt.toISOString(),
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        title: p.title,
        currentPhase: p.currentPhase,
        updatedAt: p.updatedAt.toISOString(),
      })),
    },
    user_id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.createdAt.toISOString(),
    profile: {
      display_name: user.displayName || user.email.split('@')[0],
      avatar_url: user.avatarUrl,
      account_type: user.accountType,
      theme_mode: user.themeMode,
      accent_color: user.accentColor,
      analytics_consent: user.analyticsConsent,
    },
    plan: {
      id: user.plan,
      name: user.plan.charAt(0).toUpperCase() + user.plan.slice(1),
      allowance_credits: user.creditsAllowance,
      used_credits: user.creditsUsed,
      purchased_credits: user.creditsPurchased,
      remaining_credits: Math.max(0, user.creditsAllowance + user.creditsPurchased - user.creditsUsed),
    },
    projects: projects.map((p) => ({
      id: p.id,
      project_id: p.id,
      name: p.name,
      title: p.title,
      currentPhase: p.currentPhase,
      current_phase: p.currentPhase,
      starred: p.starred,
      createdAt: p.createdAt.toISOString(),
      created_at: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    })),
  });
}

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (typeof body.display_name === 'string' || typeof body.displayName === 'string') {
    data.displayName = String(body.display_name ?? body.displayName).trim().slice(0, 60) || null;
  }
  if ('account_type' in body || 'accountType' in body) {
    const rawType = body.account_type ?? body.accountType;
    if (rawType === null || ['hobbyist', 'student', 'teacher', 'industry'].includes(rawType)) {
      data.accountType = rawType;
    }
  }
  const rawTheme = body.theme_mode ?? body.themeMode;
  if (typeof rawTheme === 'string' && ['light', 'dark', 'system'].includes(rawTheme)) {
    data.themeMode = rawTheme;
  }
  const rawAccent = body.accent_color ?? body.accentColor;
  if (
    typeof rawAccent === 'string' &&
    ['aurora', 'ember', 'moss', 'ocean', 'violet', 'mono'].includes(rawAccent)
  ) {
    data.accentColor = rawAccent;
  }
  const rawConsent = body.analytics_consent ?? body.analyticsConsent;
  if (typeof rawConsent === 'string') {
    data.analyticsConsent = rawConsent;
  }
  if (typeof body.avatar_url === 'string' || body.avatar_url === null) {
    data.avatarUrl = body.avatar_url;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  await writeAuditLog({
    action: 'USER_PROFILE_UPDATED',
    actorUserId: user.id,
    actorEmail: user.email,
    targetType: 'USER',
    targetId: user.id,
    metadata: data,
  });

  return NextResponse.json({
    ok: true,
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
    profile: {
      display_name: updated.displayName,
      avatar_url: updated.avatarUrl,
      account_type: updated.accountType,
      theme_mode: updated.themeMode,
      accent_color: updated.accentColor,
      analytics_consent: updated.analyticsConsent,
    },
  });
}

export async function PUT(req: Request) {
  return PATCH(req);
}

export async function DELETE(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await writeAuditLog({
    action: 'USER_ACCOUNT_DELETED',
    actorUserId: user.id,
    actorEmail: user.email,
    targetType: 'USER',
    targetId: user.id,
    metadata: { email: user.email },
  });

  await prisma.user.delete({ where: { id: user.id } });
  return NextResponse.json({ ok: true, deleted: true });
}
