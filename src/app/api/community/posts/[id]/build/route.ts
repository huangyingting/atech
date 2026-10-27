import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { synthesizeProjectFromPrompt } from '@/lib/studio-engine';
import { writeAuditLog } from '@/lib/audit';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser(req);
  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!post) {
    return NextResponse.json({ error: 'Community build not found' }, { status: 404 });
  }

  const forkedName = `${post.title} (copied from community)`;
  let createdProject;

  if (post.project) {
    createdProject = await prisma.project.create({
      data: {
        name: forkedName,
        title: forkedName,
        prompt: post.project.prompt,
        ownerUserId: user?.id || null,
        ownerEmail: user?.email || null,
        boardId: post.project.boardId,
        sourcingMode: post.project.sourcingMode,
        currentPhase: 'DONE',
        writeSeq: post.project.writeSeq,
        forkedFromPostId: post.id,
        briefJson: post.project.briefJson,
        placementJson: post.project.placementJson,
        electronicsArtifactsJson: post.project.electronicsArtifactsJson,
        firmwareArtifactsJson: post.project.firmwareArtifactsJson,
        wifiConfigJson: post.project.wifiConfigJson,
        eventsJson: post.project.eventsJson,
      },
    });
  } else {
    const bundle = synthesizeProjectFromPrompt({
      prompt: `${post.title}: ${post.summary}\n${post.description}`,
      name: forkedName,
    });
    createdProject = await prisma.project.create({
      data: {
        name: forkedName,
        title: forkedName,
        prompt: bundle.brief.idea_text,
        ownerUserId: user?.id || null,
        ownerEmail: user?.email || null,
        boardId: bundle.boardId,
        sourcingMode: bundle.sourcingMode,
        currentPhase: 'DONE',
        writeSeq: 1,
        forkedFromPostId: post.id,
        briefJson: JSON.stringify(bundle.brief),
        placementJson: JSON.stringify(bundle.placement),
        electronicsArtifactsJson: JSON.stringify(bundle.electronicsArtifacts),
        firmwareArtifactsJson: JSON.stringify(bundle.firmwareArtifacts),
        wifiConfigJson: JSON.stringify(bundle.wifiConfig),
        eventsJson: JSON.stringify(bundle.events),
      },
    });
  }

  const updatedPost = await prisma.communityPost.update({
    where: { id: post.id },
    data: { buildCount: { increment: 1 } },
  });

  await writeAuditLog({
    action: 'PROJECT_FORKED_FROM_COMMUNITY',
    actorUserId: user?.id || null,
    actorEmail: user?.email || null,
    targetType: 'PROJECT',
    targetId: createdProject.id,
    metadata: { sourcePostId: post.id, title: forkedName },
  });

  return NextResponse.json({
    projectId: createdProject.id,
    project_id: createdProject.id,
    project: { id: createdProject.id },
    built: true,
    buildCount: updatedPost.buildCount,
    build_count: updatedPost.buildCount,
  });
}
