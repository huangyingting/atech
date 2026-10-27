import { NextResponse } from 'next/server';
import {
  inspectInvitationCode,
  InviteError,
  registerUserWithInvite,
} from '@/lib/invitations';
import { signStudioToken } from '@/lib/auth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code') || '';
  const result = await inspectInvitationCode(code);
  return NextResponse.json({
    valid: result.valid,
    status: result.status,
    reason: result.valid ? null : result.reason,
    assignedRole: result.invite?.assignedRole || null,
    assignedAccountType: result.invite?.assignedAccountType || null,
    emailHint: result.invite?.emailHint || null,
    expiresAt: result.invite?.expiresAt?.toISOString() || null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    const user = await registerUserWithInvite({
      email: body.email,
      password: body.password,
      inviteCode: body.inviteCode || body.invitationCode || body.code || '',
      displayName: body.displayName || body.name || null,
      accountType: body.accountType || body.account_type || null,
      ipAddress,
      userAgent,
    });

    const { token } = signStudioToken({
      id: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion,
    });

    return NextResponse.json({
      ok: true,
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
    if (err instanceof InviteError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json(
      { error: 'Registration failed due to an unexpected error.' },
      { status: 500 }
    );
  }
}
