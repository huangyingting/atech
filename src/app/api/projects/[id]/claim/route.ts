import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (project.ownerUserId && project.ownerUserId !== user.id) {
    return NextResponse.json({ error: 'Already owned by another account' }, { status: 403 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ownerUserId: user.id,
      ownerEmail: user.email,
    },
  });

  return NextResponse.json({
    ok: true,
    claimed: true,
    project_id: updated.id,
    owner_user_id: updated.ownerUserId,
  });
}
