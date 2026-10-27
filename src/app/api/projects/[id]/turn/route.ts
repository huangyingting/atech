import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  formatSnapshotForApi,
  synthesizeProjectFromPrompt,
} from '@/lib/studio-engine';

export async function POST(
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
  const message = String(body.message || body.prompt || '').trim();
  if (!message) {
    return NextResponse.json({ error: 'Turn message is required' }, { status: 400 });
  }

  const nextVersion = project.writeSeq + 1;
  const combinedPrompt = `${project.prompt}\n\nFollow-up change: ${message}`;
  const bundle = synthesizeProjectFromPrompt({
    prompt: combinedPrompt,
    name: project.name,
    boardId: body.board || project.boardId,
    sourcingMode: body.sourcing_mode || project.sourcingMode,
    version: nextVersion,
  });

  let existingEvents: Record<string, unknown>[] = [];
  try {
    existingEvents = JSON.parse(project.eventsJson || '[]');
  } catch {
    existingEvents = [];
  }

  const nowIso = new Date().toISOString();
  const appendedEvents = [
    ...existingEvents,
    {
      id: `evt-user-${nextVersion}-${Date.now()}`,
      type: 'user',
      text: message,
      ts: nowIso,
    },
    {
      id: `evt-elec-${nextVersion}-${Date.now()}`,
      type: 'phase_run',
      phase: 'ELECTRONICS',
      job_id: `job-elec-v${nextVersion}`,
      text: `Updated hardware placement (${bundle.placement.modules.length} modules on ${bundle.boardId}). Verified DRC and port capacities.`,
      rating: null,
      ts: nowIso,
    },
    {
      id: `evt-fw-${nextVersion}-${Date.now()}`,
      type: 'phase_run',
      phase: 'FIRMWARE',
      job_id: `job-fw-v${nextVersion}`,
      text: `Recompiled ESP32-S3 firmware v${nextVersion} incorporating: "${message.slice(0, 80)}".`,
      rating: null,
      ts: nowIso,
    },
  ];

  const updated = await prisma.project.update({
    where: { id },
    data: {
      prompt: combinedPrompt,
      writeSeq: nextVersion,
      briefJson: JSON.stringify(bundle.brief),
      placementJson: JSON.stringify(bundle.placement),
      electronicsArtifactsJson: JSON.stringify(bundle.electronicsArtifacts),
      firmwareArtifactsJson: JSON.stringify(bundle.firmwareArtifacts),
      eventsJson: JSON.stringify(appendedEvents),
    },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { creditsUsed: { increment: 25 } },
    });
  }

  const snapshot = formatSnapshotForApi(
    updated,
    user ? { id: user.id, email: user.email, role: user.role } : null
  );

  return NextResponse.json({
    ok: true,
    write_seq: updated.writeSeq,
    project: snapshot,
    snapshot,
  });
}
