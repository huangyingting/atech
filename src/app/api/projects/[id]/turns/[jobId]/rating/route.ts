import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string; jobId: string }> }
) {
  const { id, jobId } = await context.params;
  const user = await getAuthenticatedUser(req);
  const body = await req.json().catch(() => ({}));
  const rating = body.rating === 'down' ? 'down' : 'up';
  const comment = typeof body.comment === 'string' ? body.comment.trim() : null;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  await prisma.projectTurnRating.create({
    data: {
      projectId: id,
      jobId,
      userId: user?.id || null,
      rating,
      comment,
    },
  });

  // Update rating inside project.eventsJson
  try {
    const events = JSON.parse(project.eventsJson || '[]');
    if (Array.isArray(events)) {
      for (const ev of events) {
        if (ev.job_id === jobId) {
          ev.rating = rating;
        }
      }
      await prisma.project.update({
        where: { id },
        data: { eventsJson: JSON.stringify(events) },
      });
    }
  } catch {
    // ignore parse error
  }

  return NextResponse.json({ ok: true, job_id: jobId, rating });
}
