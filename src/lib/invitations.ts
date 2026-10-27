import { prisma } from './prisma';
import { writeAuditLog } from './audit';
import {
  generateInviteCodeString,
  hashInviteCode,
  hashPassword,
  normalizeInviteCode,
} from './passwords';

export class InviteError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface CreateInviteInput {
  customCode?: string;
  label?: string;
  emailHint?: string | null;
  assignedRole?: 'ADMIN' | 'MEMBER' | 'VIEWER';
  assignedAccountType?: 'hobbyist' | 'student' | 'teacher' | 'industry' | null;
  maxUses?: number;
  expiresInHours?: number;
  expiresAt?: Date;
  createdById?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
}

export async function createInvitationCode(input: CreateInviteInput) {
  const code = input.customCode
    ? normalizeInviteCode(input.customCode)
    : generateInviteCodeString('ATECH');
  const codeHash = hashInviteCode(code);
  const maxUses = Math.max(1, Math.min(Number(input.maxUses) || 1, 1000));
  const now = new Date();
  const expiresAt =
    input.expiresAt ||
    new Date(now.getTime() + (Number(input.expiresInHours) || 168) * 3600 * 1000);

  if (expiresAt.getTime() <= now.getTime()) {
    throw new InviteError(400, 'invalid_expiry', 'Invitation expiration must be in the future.');
  }

  const assignedRole = ['ADMIN', 'MEMBER', 'VIEWER'].includes(input.assignedRole || '')
    ? (input.assignedRole as string)
    : 'MEMBER';
  const assignedAccountType = ['hobbyist', 'student', 'teacher', 'industry'].includes(
    input.assignedAccountType || ''
  )
    ? (input.assignedAccountType as string)
    : null;
  const emailHint = input.emailHint ? input.emailHint.trim().toLowerCase() : null;

  const existing = await prisma.invitationCode.findUnique({ where: { codeHash } });
  if (existing) {
    throw new InviteError(409, 'duplicate_code', 'An invitation with this code already exists.');
  }

  const invite = await prisma.invitationCode.create({
    data: {
      code,
      codeHash,
      label: input.label?.trim() || null,
      emailHint,
      assignedRole,
      assignedAccountType,
      maxUses,
      usedCount: 0,
      expiresAt,
      createdById: input.createdById || null,
    },
  });

  await writeAuditLog({
    action: 'INVITE_CREATED',
    actorUserId: input.createdById || null,
    actorEmail: input.actorEmail || null,
    targetType: 'INVITE',
    targetId: invite.id,
    ipAddress: input.ipAddress || null,
    metadata: {
      code: invite.code,
      assignedRole: invite.assignedRole,
      assignedAccountType: invite.assignedAccountType,
      maxUses: invite.maxUses,
      emailHint: invite.emailHint,
      expiresAt: invite.expiresAt.toISOString(),
    },
  });

  return invite;
}

export async function inspectInvitationCode(rawCode: string, now = new Date()) {
  const normalized = normalizeInviteCode(rawCode);
  if (!normalized) {
    return { valid: false, status: 'invalid' as const, reason: 'Invitation code is required.' };
  }
  const codeHash = hashInviteCode(normalized);
  const invite = await prisma.invitationCode.findFirst({
    where: {
      OR: [{ codeHash }, { code: normalized }],
    },
  });

  if (!invite) {
    return { valid: false, status: 'invalid' as const, reason: 'Invitation code not found.' };
  }
  if (invite.revokedAt) {
    return {
      valid: false,
      status: 'revoked' as const,
      reason: 'This invitation code has been revoked.',
      invite,
    };
  }
  if (invite.expiresAt.getTime() <= now.getTime()) {
    return {
      valid: false,
      status: 'expired' as const,
      reason: 'This invitation code has expired.',
      invite,
    };
  }
  if (invite.usedCount >= invite.maxUses) {
    return {
      valid: false,
      status: 'exhausted' as const,
      reason: 'This invitation code has already been used.',
      invite,
    };
  }

  return {
    valid: true,
    status: 'active' as const,
    invite,
  };
}

export async function revokeInvitationCode(params: {
  id: string;
  reason?: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
}) {
  const invite = await prisma.invitationCode.findUnique({ where: { id: params.id } });
  if (!invite) {
    throw new InviteError(404, 'not_found', 'Invitation code not found.');
  }
  if (invite.revokedAt) {
    return invite;
  }

  const updated = await prisma.invitationCode.update({
    where: { id: params.id },
    data: {
      revokedAt: new Date(),
      revokedReason: params.reason || 'Revoked by administrator',
    },
  });

  await writeAuditLog({
    action: 'INVITE_REVOKED',
    actorUserId: params.actorUserId || null,
    actorEmail: params.actorEmail || null,
    targetType: 'INVITE',
    targetId: updated.id,
    ipAddress: params.ipAddress || null,
    metadata: {
      code: updated.code,
      reason: updated.revokedReason,
    },
  });

  return updated;
}

export interface RegisterWithInviteInput {
  email: string;
  password: string;
  inviteCode: string;
  displayName?: string | null;
  accountType?: 'hobbyist' | 'student' | 'teacher' | 'industry' | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function registerUserWithInvite(input: RegisterWithInviteInput) {
  const normalizedEmail = String(input.email || '').trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new InviteError(400, 'invalid_email', 'Please enter a valid email address.');
  }
  if (!input.password || String(input.password).length < 8) {
    throw new InviteError(400, 'weak_password', 'Password must be at least 8 characters long.');
  }

  const rawCode = String(input.inviteCode || '').trim();
  if (!rawCode) {
    await writeAuditLog({
      action: 'AUTH_REGISTER_REJECTED',
      actorEmail: normalizedEmail,
      targetType: 'INVITE',
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
      metadata: { reason: 'missing_invite_code' },
    });
    throw new InviteError(
      403,
      'invite_required',
      'Registration is invite-only. A valid invitation code is required.'
    );
  }

  const now = new Date();
  const inspection = await inspectInvitationCode(rawCode, now);
  if (!inspection.valid || !inspection.invite) {
    await writeAuditLog({
      action: 'AUTH_REGISTER_REJECTED',
      actorEmail: normalizedEmail,
      targetType: 'INVITE',
      targetId: inspection.invite?.id || null,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
      metadata: {
        reason: inspection.status,
        codeAttempted: normalizeInviteCode(rawCode),
      },
    });
    throw new InviteError(
      403,
      `invite_${inspection.status}`,
      inspection.reason || 'Invalid invitation code.'
    );
  }

  const invite = inspection.invite;
  if (invite.emailHint && invite.emailHint.toLowerCase() !== normalizedEmail) {
    await writeAuditLog({
      action: 'AUTH_REGISTER_REJECTED',
      actorEmail: normalizedEmail,
      targetType: 'INVITE',
      targetId: invite.id,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
      metadata: { reason: 'email_mismatch', expectedEmail: invite.emailHint },
    });
    throw new InviteError(
      403,
      'email_mismatch',
      'This invitation code is restricted to a different email address.'
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new InviteError(409, 'email_taken', 'An account with this email already exists.');
  }

  const passwordHash = await hashPassword(input.password);
  const defaultDisplayName =
    input.displayName?.trim() || normalizedEmail.split('@')[0].slice(0, 40);
  const chosenAccountType =
    input.accountType ||
    (invite.assignedAccountType as 'hobbyist' | 'student' | 'teacher' | 'industry' | null) ||
    null;

  const createdUser = await prisma.$transaction(async (tx) => {
    const updatedInvite = await tx.invitationCode.updateMany({
      where: {
        id: invite.id,
        revokedAt: null,
        expiresAt: { gt: now },
        usedCount: { lt: invite.maxUses },
      },
      data: {
        usedCount: { increment: 1 },
      },
    });

    if (updatedInvite.count === 0) {
      throw new InviteError(
        403,
        'invite_exhausted',
        'This invitation code is no longer available.'
      );
    }

    return tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        displayName: defaultDisplayName,
        role: invite.assignedRole || 'MEMBER',
        accountType: chosenAccountType,
        status: 'ACTIVE',
        plan: invite.assignedRole === 'ADMIN' ? 'max' : 'free',
        creditsAllowance: invite.assignedRole === 'ADMIN' ? 100000 : 2000,
        invitedByCodeId: invite.id,
      },
    });
  });

  await writeAuditLog({
    action: 'INVITE_REDEEMED',
    actorUserId: createdUser.id,
    actorEmail: createdUser.email,
    targetType: 'INVITE',
    targetId: invite.id,
    ipAddress: input.ipAddress || null,
    userAgent: input.userAgent || null,
    metadata: {
      code: invite.code,
      usedCountAfter: invite.usedCount + 1,
      maxUses: invite.maxUses,
    },
  });

  await writeAuditLog({
    action: 'AUTH_REGISTER_SUCCESS',
    actorUserId: createdUser.id,
    actorEmail: createdUser.email,
    targetType: 'USER',
    targetId: createdUser.id,
    ipAddress: input.ipAddress || null,
    userAgent: input.userAgent || null,
    metadata: {
      role: createdUser.role,
      accountType: createdUser.accountType,
      inviteCode: invite.code,
    },
  });

  return createdUser;
}
