import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const nextStarred = typeof body.starred === 'boolean' ? body.starred : !project.starred;

  const updated = await prisma.project.update({
    where: { id },
    data: { starred: nextStarred },
  });

  return NextResponse.json({ ok: true, starred: updated.starred });
}
