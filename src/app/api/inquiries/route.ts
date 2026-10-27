import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const vertical = ['education', 'industry', 'hackathons'].includes(body.vertical)
    ? body.vertical
    : 'industry';
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const organization = String(body.organization || '').trim();
  const role = String(body.role || '').trim();
  const quantityEstimate = String(body.quantityEstimate || body.quantity || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Name, email, and project/curriculum message are required.' },
      { status: 400 }
    );
  }

  const inquiry = await prisma.enterpriseInquiry.create({
    data: {
      vertical,
      name,
      email,
      organization: organization || 'Independent',
      role: role || null,
      quantityEstimate: quantityEstimate || null,
      message,
    },
  });

  await writeAuditLog({
    action: 'ENTERPRISE_INQUIRY_SUBMITTED',
    actorEmail: email,
    targetType: 'INQUIRY',
    targetId: inquiry.id,
    metadata: { vertical, organization, quantityEstimate },
  });

  return NextResponse.json({
    ok: true,
    inquiry_id: inquiry.id,
    status: inquiry.status,
  });
}
