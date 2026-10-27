import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  createInvitationCode,
  InviteError,
  revokeInvitationCode,
} from '@/lib/invitations';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const invites = await prisma.invitationCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      redeemedUsers: { select: { id: true, email: true, displayName: true, role: true } },
    },
  });

  return NextResponse.json({
    invites: invites.map((inv) => ({
      ...inv,
      role: inv.assignedRole,
      accountType: inv.assignedAccountType,
      expiresAt: inv.expiresAt.toISOString(),
      revokedAt: inv.revokedAt?.toISOString() || null,
      createdAt: inv.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const invite = await createInvitationCode({
      customCode: body.customCode || body.code || undefined,
      label: body.label || undefined,
      emailHint: body.emailHint || body.email || null,
      assignedRole: body.assignedRole || body.role || 'MEMBER',
      assignedAccountType: body.assignedAccountType || body.accountType || null,
      maxUses: Number(body.maxUses) || 1,
      expiresInHours: Number(body.expiresInHours) || 168,
      createdById: user.id,
      actorEmail: user.email,
      ipAddress,
    });

    return NextResponse.json({
      ok: true,
      invite: {
        id: invite.id,
        code: invite.code,
        label: invite.label,
        emailHint: invite.emailHint,
        email_hint: invite.emailHint,
        role: invite.assignedRole,
        assignedRole: invite.assignedRole,
        assigned_role: invite.assignedRole,
        accountType: invite.assignedAccountType,
        assignedAccountType: invite.assignedAccountType,
        assigned_account_type: invite.assignedAccountType,
        maxUses: invite.maxUses,
        max_uses: invite.maxUses,
        usedCount: invite.usedCount,
        used_count: invite.usedCount,
        expiresAt: invite.expiresAt.toISOString(),
        expires_at: invite.expiresAt.toISOString(),
        revokedAt: null,
        revoked_at: null,
        createdAt: invite.createdAt.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof InviteError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to create invitation code.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '');
    if (!id) {
      return NextResponse.json({ error: 'Invitation ID is required.' }, { status: 400 });
    }

    const updated = await revokeInvitationCode({
      id,
      reason: body.reason || 'Revoked by administrator',
      actorUserId: user.id,
      actorEmail: user.email,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      ok: true,
      invite: {
        id: updated.id,
        code: updated.code,
        revokedAt: updated.revokedAt?.toISOString() || null,
        revoked_at: updated.revokedAt?.toISOString() || null,
      },
    });
  } catch (err) {
    if (err instanceof InviteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to revoke invitation code.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const id = String(url.searchParams.get('id') || body.id || '');
    if (!id) {
      return NextResponse.json({ error: 'Invitation ID is required.' }, { status: 400 });
    }

    const updated = await revokeInvitationCode({
      id,
      reason: body.reason || 'Revoked by administrator',
      actorUserId: user.id,
      actorEmail: user.email,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      ok: true,
      invite: {
        id: updated.id,
        code: updated.code,
        revokedAt: updated.revokedAt?.toISOString() || null,
        revoked_at: updated.revokedAt?.toISOString() || null,
      },
    });
  } catch (err) {
    if (err instanceof InviteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to revoke invitation code.' }, { status: 500 });
  }
}
