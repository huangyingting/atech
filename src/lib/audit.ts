import { prisma } from './prisma';

export interface WriteAuditLogInput {
  action: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  targetType: 'USER' | 'INVITE' | 'PROJECT' | 'COMMUNITY_POST' | 'ORDER' | 'SUPPORT' | 'INQUIRY' | 'SYSTEM';
  targetId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(input: WriteAuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        action: input.action,
        actorUserId: input.actorUserId || null,
        actorEmail: input.actorEmail || null,
        targetType: input.targetType,
        targetId: input.targetId || null,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        metadataJson: JSON.stringify(input.metadata || {}),
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit entry:', err);
    return null;
  }
}

export async function listAuditLogs(options?: {
  action?: string;
  targetType?: string;
  limit?: number;
}) {
  const limit = Math.min(Math.max(options?.limit || 100, 1), 500);
  const logs = await prisma.auditLog.findMany({
    where: {
      ...(options?.action ? { action: options.action } : {}),
      ...(options?.targetType ? { targetType: options.targetType } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      actor: {
        select: { id: true, email: true, displayName: true, role: true },
      },
    },
  });

  return logs.map((row) => {
    let metadata: Record<string, unknown> = {};
    try {
      metadata = JSON.parse(row.metadataJson || '{}');
    } catch {
      metadata = {};
    }
    return {
      id: row.id,
      action: row.action,
      actorUserId: row.actorUserId,
      actorEmail: row.actorEmail || row.actor?.email || null,
      actorName: row.actor?.displayName || null,
      targetType: row.targetType,
      targetId: row.targetId,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      metadata,
      createdAt: row.createdAt.toISOString(),
    };
  });
}
