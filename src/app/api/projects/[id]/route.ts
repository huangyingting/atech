import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  formatSnapshotForApi,
  synthesizeProjectFromPrompt,
} from '@/lib/studio-engine';
import { writeAuditLog } from '@/lib/audit';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser(req);
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const snapshot = formatSnapshotForApi(
    project,
    user ? { id: user.id, email: user.email, role: user.role } : null
  );

  return NextResponse.json({
    ...snapshot,
    project: snapshot,
  });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser(req);
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {
    writeSeq: project.writeSeq + 1,
  };

  const rawTitle = typeof body.name === 'string' ? body.name : typeof body.title === 'string' ? body.title : '';
  if (rawTitle.trim()) {
    data.name = rawTitle.trim();
    data.title = rawTitle.trim();
  }
  if (typeof body.idea_text === 'string' && body.idea_text.trim()) {
    const newPrompt = body.idea_text.trim();
    const resynthesized = synthesizeProjectFromPrompt({
      prompt: newPrompt,
      name: (data.name as string) || project.name,
      boardId: body.board || project.boardId,
      sourcingMode: body.sourcing_mode || project.sourcingMode,
      version: project.writeSeq + 1,
    });
    data.prompt = newPrompt;
    data.briefJson = JSON.stringify(resynthesized.brief);
    data.placementJson = JSON.stringify(resynthesized.placement);
    data.electronicsArtifactsJson = JSON.stringify(resynthesized.electronicsArtifacts);
    data.firmwareArtifactsJson = JSON.stringify(resynthesized.firmwareArtifacts);
  }
  if (body.placement) {
    data.placementJson = JSON.stringify(body.placement);
  } else if (Array.isArray(body.placements)) {
    let existingPlacement: Record<string, unknown> = { board: project.boardId, map: '', modules: [] };
    try {
      existingPlacement = JSON.parse(project.placementJson || '{}');
    } catch {
      // ignore
    }
    data.placementJson = JSON.stringify({
      ...existingPlacement,
      modules: body.placements,
    });
  }
  if (body.wifi) {
    data.wifiConfigJson = JSON.stringify(body.wifi);
  }
  if (typeof body.starred === 'boolean') {
    data.starred = body.starred;
  }
  if (typeof body.featured === 'boolean') {
    data.featured = body.featured;
  }

  const updated = await prisma.project.update({
    where: { id },
    data,
  });

  const snapshot = formatSnapshotForApi(
    updated,
    user ? { id: user.id, email: user.email, role: user.role } : null
  );

  return NextResponse.json({
    ...snapshot,
    project: snapshot,
  });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getAuthenticatedUser(req);
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (project.ownerUserId && (!user || (project.ownerUserId !== user.id && user.role !== 'ADMIN'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.project.delete({ where: { id } });

  await writeAuditLog({
    action: 'PROJECT_DELETED',
    actorUserId: user?.id || null,
    actorEmail: user?.email || null,
    targetType: 'PROJECT',
    targetId: id,
    metadata: { name: project.name },
  });

  return NextResponse.json({ ok: true, deleted: true });
}
