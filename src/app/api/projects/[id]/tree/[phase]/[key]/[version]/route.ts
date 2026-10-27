import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string; phase: string; key: string; version: string }> }
) {
  const { id, phase, key, version } = await context.params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  let fw: { version?: number; files?: Record<string, string> } = {};
  try {
    fw = JSON.parse(project.firmwareArtifactsJson || '{}');
  } catch {
    fw = {};
  }

  const files = fw.files || {};
  return NextResponse.json({
    project_id: id,
    phase,
    key,
    version: Number(version) || fw.version || 1,
    files: Object.entries(files).map(([name, content]) => ({
      path: name,
      size: content.length,
      content,
    })),
  });
}
