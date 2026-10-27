import 'dotenv/config';
import { createInvitationCode } from '../src/lib/invitations';
import { prisma } from '../src/lib/prisma';

async function main() {
  const args = process.argv.slice(2);
  const customCode = args[0] || process.env.BOOTSTRAP_ADMIN_INVITE_CODE || undefined;
  const roleArg = (args[1] as 'ADMIN' | 'MEMBER' | 'VIEWER' | undefined) || 'ADMIN';
  const maxUses = Number(args[2]) || 1;
  const expiresInHours = Number(args[3]) || 168;

  const invite = await createInvitationCode({
    customCode,
    label: `CLI Bootstrap (${roleArg})`,
    assignedRole: roleArg,
    assignedAccountType: 'industry',
    maxUses,
    expiresInHours,
  });

  console.log(JSON.stringify({
    ok: true,
    id: invite.id,
    code: invite.code,
    assignedRole: invite.assignedRole,
    maxUses: invite.maxUses,
    expiresAt: invite.expiresAt.toISOString(),
  }));
}

main()
  .catch((err) => {
    console.error('Bootstrap invite error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
