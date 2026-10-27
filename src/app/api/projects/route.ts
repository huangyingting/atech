import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  formatSnapshotForApi,
  synthesizeProjectFromPrompt,
} from '@/lib/studio-engine';
import { writeAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  const url = new URL(req.url);
  const anonIdsRaw = url.searchParams.get('anon_ids') || '';
  const anonIds = anonIdsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!user && anonIds.length === 0) {
    return NextResponse.json({ projects: [] });
  }

  const rows = await prisma.project.findMany({
    where: user
      ? {
          OR: [
            { ownerUserId: user.id },
            ...(anonIds.length > 0 ? [{ id: { in: anonIds }, ownerUserId: null }] : []),
          ],
        }
      : { id: { in: anonIds }, ownerUserId: null },
    orderBy: { updatedAt: 'desc' },
  });

  const projects = rows.map((row) => {
    let parsedMods: Array<Record<string, unknown>> = [];
    try {
      const parsed = JSON.parse(row.placementJson || '{}');
      parsedMods = Array.isArray(parsed.modules) ? parsed.modules : [];
    } catch {
      parsedMods = [];
    }
    const moduleCount = parsedMods.length;
    const verKey = `v${row.writeSeq || 1}`;
    const normalizedMods = parsedMods.map((m, idx) => ({
      ...m,
      instance_id: String(m.instance_id || `${m.module_id || 'mod'}_${idx + 1}`),
      part_id: String(m.part_id || m.module_id || 'button'),
      slot: String(
        m.slot ||
          (Array.isArray(m.ports) && m.ports[0]
            ? String(m.ports[0]).replace('port_', 'S')
            : `S${idx + 1}`)
      ),
    }));
    return {
      id: row.id,
      project_id: row.id,
      writeSeq: row.writeSeq,
      write_seq: row.writeSeq,
      phase: row.currentPhase,
      currentPhase: row.currentPhase,
      current_phase: row.currentPhase,
      prompt: row.prompt,
      name: row.name,
      title: row.title,
      boardId: row.boardId,
      board: row.boardId,
      sourcingMode: row.sourcingMode,
      module_count: moduleCount,
      ownerUserId: row.ownerUserId,
      owner_user_id: row.ownerUserId,
      ownerEmail: row.ownerEmail,
      createdAt: row.createdAt.toISOString(),
      created_at: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      featured: row.featured,
      starred: row.starred,
      live_jobs: 0,
      ownership: user && row.ownerUserId === user.id ? 'mine' : 'anonymous',
      turns: [{ jobId: `job-${row.id}`, prompt: row.prompt }],
      tree: {
        electronics: {
          latest: verKey,
          versions: {
            [verKey]: {
              modules: normalizedMods,
            },
          },
        },
        firmware: {
          latest: verKey,
        },
      },
    };
  });

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));
    const prompt = String(body.prompt || body.idea_text || '').trim();
    const boardId = String(body.board || body.boardId || '14port_board');
    const sourcingMode = String(body.sourcing_mode || body.sourcingMode || 'atech_preferred');

    const bundle = synthesizeProjectFromPrompt({
      prompt: prompt || 'Build an interactive game console with Color Display, Knob, Button, Speaker, and LED Grid',
      name: body.name || undefined,
      boardId,
      sourcingMode,
      version: 1,
    });

    const created = await prisma.project.create({
      data: {
        name: bundle.name,
        title: bundle.title,
        prompt: bundle.brief.idea_text,
        ownerUserId: user?.id || null,
        ownerEmail: user?.email || null,
        boardId: bundle.boardId,
        sourcingMode: bundle.sourcingMode,
        currentPhase: 'DONE',
        writeSeq: 1,
        briefJson: JSON.stringify(bundle.brief),
        placementJson: JSON.stringify(bundle.placement),
        electronicsArtifactsJson: JSON.stringify(bundle.electronicsArtifacts),
        firmwareArtifactsJson: JSON.stringify(bundle.firmwareArtifacts),
        wifiConfigJson: JSON.stringify(bundle.wifiConfig),
        eventsJson: JSON.stringify(bundle.events),
      },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { creditsUsed: { increment: 45 } },
      });
    }

    await writeAuditLog({
      action: 'PROJECT_CREATED',
      actorUserId: user?.id || null,
      actorEmail: user?.email || null,
      targetType: 'PROJECT',
      targetId: created.id,
      metadata: {
        name: created.name,
        boardId: created.boardId,
        sourcingMode: created.sourcingMode,
        modulesCount: bundle.placement.modules.length,
      },
    });

    const snapshot = formatSnapshotForApi(
      created,
      user ? { id: user.id, email: user.email, role: user.role } : null
    );

    return NextResponse.json({
      id: created.id,
      project_id: created.id,
      project: snapshot,
      snapshot,
    });
  } catch (err) {
    console.error('[POST /api/projects]', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
