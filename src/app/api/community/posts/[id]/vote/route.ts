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
    return NextResponse.json({ error: 'Sign in required to vote.' }, { status: 401 });
  }

  const post = await prisma.communityPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const existing = await prisma.communityVote.findUnique({
    where: { postId_userId: { postId: id, userId: user.id } },
  });

  const nextVoted = typeof body.voted === 'boolean' ? body.voted : !existing?.voted;

  await prisma.communityVote.upsert({
    where: { postId_userId: { postId: id, userId: user.id } },
    update: { voted: nextVoted },
    create: { postId: id, userId: user.id, voted: nextVoted },
  });

  const delta = nextVoted && !existing?.voted ? 1 : !nextVoted && existing?.voted ? -1 : 0;
  const updated = await prisma.communityPost.update({
    where: { id },
    data: { score: Math.max(0, post.score + delta) },
  });

  return NextResponse.json({
    ok: true,
    voted: nextVoted,
    viewerVoted: nextVoted,
    score: updated.score,
    upvoteCount: updated.score,
  });
}
