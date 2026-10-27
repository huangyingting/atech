import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const admin = await getAuthenticatedUser(req);
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  let auditAction = 'USER_UPDATED_BY_ADMIN';

  if (typeof body.role === 'string' && ['ADMIN', 'MEMBER', 'VIEWER'].includes(body.role)) {
    data.role = body.role;
    auditAction = 'USER_ROLE_CHANGED';
  }
  if (typeof body.plan === 'string' && ['free', 'standard', 'pro', 'max'].includes(body.plan)) {
    data.plan = body.plan;
  }
  if (body.status === 'REVOKED') {
    data.status = 'REVOKED';
    data.revokedAt = new Date();
    data.revokedReason = body.reason || 'Revoked by administrator';
    data.sessionVersion = target.sessionVersion + 1;
    auditAction = 'USER_REVOKED';
  } else if (body.status === 'ACTIVE') {
    data.status = 'ACTIVE';
    data.revokedAt = null;
    data.revokedReason = null;
    auditAction = 'USER_RESTORED';
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
  });

  await writeAuditLog({
    action: auditAction,
    actorUserId: admin.id,
    actorEmail: admin.email,
    targetType: 'USER',
    targetId: updated.id,
    metadata: {
      targetEmail: updated.email,
      changes: data,
    },
  });

  if (body.status === 'REVOKED' || body.status === 'ACTIVE') {
    await writeAuditLog({
      action: 'USER_STATUS_CHANGED',
      actorUserId: admin.id,
      actorEmail: admin.email,
      targetType: 'USER',
      targetId: updated.id,
      metadata: {
        targetEmail: updated.email,
        status: updated.status,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      status: updated.status,
      plan: updated.plan,
      sessionVersion: updated.sessionVersion,
    },
  });
}
