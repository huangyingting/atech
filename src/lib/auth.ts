import crypto from 'node:crypto';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { verifyPassword } from './passwords';
import { writeAuditLog } from './audit';

const SECRET = process.env.NEXTAUTH_SECRET || 'atech-production-grade-secret-key-2026-copenhagen-esp32s3';

export interface StudioSessionTokenPayload {
  sub: string;
  email: string;
  role: string;
  sv: number;
  exp: number;
}

export function signStudioToken(user: {
  id: string;
  email: string;
  role: string;
  sessionVersion: number;
}, expiresInSec = 3600 * 24): { token: string; exp: number } {
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const payload: StudioSessionTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    sv: user.sessionVersion,
    exp,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return { token: `${body}.${sig}`, exp };
}

export function verifyStudioToken(token: string): StudioSessionTokenPayload | null {
  try {
    const [body, sig] = String(token || '').split('.');
    if (!body || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as StudioSessionTokenPayload;
    if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').trim().toLowerCase();
        const password = String(credentials?.password || '');
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          await writeAuditLog({
            action: 'AUTH_LOGIN_FAILED',
            actorEmail: email,
            targetType: 'USER',
            metadata: { reason: 'user_not_found' },
          });
          return null;
        }

        if (user.status !== 'ACTIVE') {
          await writeAuditLog({
            action: 'AUTH_LOGIN_FAILED',
            actorUserId: user.id,
            actorEmail: user.email,
            targetType: 'USER',
            targetId: user.id,
            metadata: { reason: `account_${user.status.toLowerCase()}` },
          });
          throw new Error('This account has been revoked or suspended.');
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          await writeAuditLog({
            action: 'AUTH_LOGIN_FAILED',
            actorUserId: user.id,
            actorEmail: user.email,
            targetType: 'USER',
            targetId: user.id,
            metadata: { reason: 'invalid_password' },
          });
          return null;
        }

        await writeAuditLog({
          action: 'AUTH_LOGIN_SUCCESS',
          actorUserId: user.id,
          actorEmail: user.email,
          targetType: 'USER',
          targetId: user.id,
          metadata: { role: user.role },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: user.role,
          accountType: user.accountType,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.accountType = (user as unknown as { accountType?: string | null }).accountType || null;
        token.sv = (user as unknown as { sessionVersion: number }).sessionVersion || 1;
      }
      if (token.uid) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.uid) },
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            accountType: true,
            status: true,
            sessionVersion: true,
          },
        });
        if (!dbUser || dbUser.status !== 'ACTIVE' || dbUser.sessionVersion !== token.sv) {
          return { ...token, revoked: true };
        }
        token.email = dbUser.email;
        token.name = dbUser.displayName || dbUser.email.split('@')[0];
        token.role = dbUser.role;
        token.accountType = dbUser.accountType;
      }
      return token;
    },
    async session({ session, token }) {
      if ((token as { revoked?: boolean }).revoked || !token.uid) {
        return { ...session, user: undefined };
      }
      if (session.user) {
        Object.assign(session.user, {
          id: String(token.uid),
          email: String(token.email || ''),
          name: String(token.name || ''),
          role: String(token.role || 'MEMBER'),
          accountType: (token.accountType as string | null) || null,
        });
      }
      return session;
    },
  },
  secret: SECRET,
};

export async function getAuthenticatedUser(req?: Request) {
  if (req) {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      const rawToken = authHeader.slice(7).trim();
      const verified = verifyStudioToken(rawToken);
      if (verified) {
        const user = await prisma.user.findUnique({ where: { id: verified.sub } });
        if (user && user.status === 'ACTIVE' && user.sessionVersion === verified.sv) {
          return user;
        }
      }
    }
  }

  try {
    const session = await getServerSession(authOptions);
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (!uid) return null;
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user || user.status !== 'ACTIVE') return null;
    return user;
  } catch {
    return null;
  }
}
