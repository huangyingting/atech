import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/passwords';
import { signStudioToken } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await writeAuditLog({
        action: 'AUTH_LOGIN_FAILED',
        actorEmail: email,
        targetType: 'USER',
        ipAddress,
        metadata: { reason: 'user_not_found' },
      });
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      await writeAuditLog({
        action: 'AUTH_LOGIN_FAILED',
        actorUserId: user.id,
        actorEmail: user.email,
        targetType: 'USER',
        targetId: user.id,
        ipAddress,
        metadata: { reason: `account_${user.status.toLowerCase()}` },
      });
      return NextResponse.json(
        { error: 'This account has been revoked or suspended.' },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await writeAuditLog({
        action: 'AUTH_LOGIN_FAILED',
        actorUserId: user.id,
        actorEmail: user.email,
        targetType: 'USER',
        targetId: user.id,
        ipAddress,
        metadata: { reason: 'invalid_password' },
      });
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    await writeAuditLog({
      action: 'AUTH_LOGIN_SUCCESS',
      actorUserId: user.id,
      actorEmail: user.email,
      targetType: 'USER',
      targetId: user.id,
      ipAddress,
      metadata: { role: user.role },
    });

    const { token } = signStudioToken({
      id: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion,
    });

    return NextResponse.json({
      access_token: token,
      refresh_token: token,
      expires_in: 86400,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role: user.role,
        account_type: user.accountType,
      },
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}
