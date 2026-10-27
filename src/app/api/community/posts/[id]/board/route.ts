import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { synthesizeProjectFromPrompt } from '@/lib/studio-engine';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: { project: true },
  });

  const promptText =
    post?.project?.prompt ||
    post?.description ||
    post?.summary ||
    post?.title ||
    'Interactive Atech 14-Port board with Color Display, Knob, Button, LED Grid, and Speaker';

  const synth = synthesizeProjectFromPrompt({
    prompt: promptText,
    sourcingMode: 'atech_preferred',
    boardId: '14port_board',
  });
  let slots = synth.placement.modules;
  if (post?.project?.placementJson) {
    try {
      const parsed = JSON.parse(post.project.placementJson);
      if (Array.isArray(parsed?.modules) && parsed.modules.length > 0) {
        slots = parsed.modules;
      }
    } catch {
      // use synthesized placement
    }
  }

  return NextResponse.json({
    ok: true,
    post_id: id,
    title: post?.title || 'Community Build',
    board_type: post?.project?.boardId || '14port_board',
    slots,
    wiring: synth.electronicsArtifacts.wiring,
    firmware_files: synth.firmwareArtifacts.files,
    emulation: {
      ok: true,
      board: '14port_board',
      pace_note: 'Running in browser ESP32-S3 simulator · Click or hold modules to interact',
    },
  });
}
