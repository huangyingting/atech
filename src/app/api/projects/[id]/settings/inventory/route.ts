import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const sourcing = String(body.sourcing || 'atech_preferred');
    const ownedDescription =
      body.owned_description !== undefined ? String(body.owned_description) : '';

    const project = await prisma.project.findUnique({ where: { id } });
    if (project) {
      let existingBrief: Record<string, unknown> = {};
      try {
        existingBrief = JSON.parse(project.briefJson || '{}');
      } catch {
        existingBrief = {};
      }
      await prisma.project.update({
        where: { id },
        data: {
          sourcingMode: sourcing,
          briefJson: JSON.stringify({
            ...existingBrief,
            inventory: {
              sourcing,
              owned_description: ownedDescription,
              updated_at: new Date().toISOString(),
            },
          }),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      sourcing,
      owned_description: ownedDescription,
      staled: ['ELECTRONICS'],
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'INVENTORY_UPDATE_FAILED', message: (err as Error).message },
      { status: 500 }
    );
  }
}
