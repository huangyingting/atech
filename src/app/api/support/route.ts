import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || user?.email || 'anonymous@atech.dev').trim();
  const message = String(body.message || '').trim();
  const subject = String(body.subject || 'Studio Support Request').trim();
  const pageUrl = String(body.page_url || body.pageUrl || '').trim();
  const projectId = body.project_id || body.projectId || null;

  if (!message) {
    return NextResponse.json({ error: 'Support message is required.' }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user?.id || null,
      email,
      pageUrl: pageUrl || null,
      projectId,
      subject,
      message,
    },
  });

  await writeAuditLog({
    action: 'SUPPORT_TICKET_SUBMITTED',
    actorUserId: user?.id || null,
    actorEmail: email,
    targetType: 'SUPPORT',
    targetId: ticket.id,
    metadata: { subject, pageUrl, projectId },
  });

  return NextResponse.json({
    ok: true,
    ticket_id: ticket.id,
    status: ticket.status,
  });
}
