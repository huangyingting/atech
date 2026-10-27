import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || 'All';
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();

  const rows = await prisma.communityPost.findMany({
    where: {
      ...(category && category !== 'All' ? { category } : {}),
    },
    orderBy: [{ featured: 'desc' }, { score: 'desc' }, { createdAt: 'desc' }],
    include: {
      votes: user ? { where: { userId: user.id } } : false,
    },
  });

  const filtered = q
    ? rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.authorHandle.toLowerCase().includes(q)
      )
    : rows;

  const posts = filtered.map((r) => {
    let rawModules: Array<Record<string, unknown>> = [];
    try {
      rawModules = JSON.parse(r.modulesJson || '[]');
    } catch {
      rawModules = [];
    }
    const modules = (Array.isArray(rawModules) ? rawModules : []).map((m, idx) => ({
      ...m,
      instance_id: String(m.instance_id || `${m.module_id || 'mod'}_${idx + 1}`),
      part_id: String(m.part_id || m.module_id || 'button'),
      slot: String(
        m.slot ||
          (Array.isArray(m.ports) && m.ports[0]
            ? String(m.ports[0]).replace('port_', 'S')
            : `S${idx + 1}`)
      ),
      rotation_deg: Number(m.rotation_deg || 0),
    }));
    const userVotes = Array.isArray(r.votes) ? r.votes : [];
    const viewerVoted = userVotes.some((v) => v.voted);
    return {
      id: r.id,
      projectId: r.projectId,
      project_id: r.projectId,
      authorUserId: r.authorUserId,
      author_user_id: r.authorUserId,
      authorHandle: r.authorHandle,
      author_handle: r.authorHandle,
      authorName: r.authorHandle,
      title: r.title,
      summary: r.summary,
      description: r.description,
      body: r.description,
      category: r.category,
      tags: [r.category, 'esp32-s3', 'modular'],
      modules,
      modulesJson: r.modulesJson,
      score: r.score,
      upvoteCount: r.score,
      buildCount: r.buildCount,
      build_count: r.buildCount,
      featured: r.featured,
      viewerVoted,
      userVoted: viewerVoted,
      viewer_voted: viewerVoted,
      createdAt: r.createdAt.toISOString(),
      created_at: r.createdAt.toISOString(),
    };
  });

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Sign in required to publish a community build.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const title = String(body.title || '').trim();
  const summary = String(body.summary || body.description || '').trim();
  const description = String(body.description || summary).trim();
  const category = ['Game', 'Robotics', 'SmartHome', 'Gadgets'].includes(body.category)
    ? body.category
    : 'Gadgets';
  const projectId = body.project_id || body.projectId || null;

  if (!title) {
    return NextResponse.json({ error: 'Build title is required.' }, { status: 400 });
  }

  let modulesJson = '[]';
  if (projectId) {
    const proj = await prisma.project.findUnique({ where: { id: projectId } });
    if (proj) {
      try {
        const placement = JSON.parse(proj.placementJson || '{}');
        modulesJson = JSON.stringify(placement.modules || []);
      } catch {
        modulesJson = '[]';
      }
    }
  }

  const created = await prisma.communityPost.create({
    data: {
      projectId,
      authorUserId: user.id,
      authorHandle: user.displayName || user.email.split('@')[0],
      title,
      summary: summary || `${title} built with Atech Studio`,
      description,
      category,
      modulesJson,
      score: 1,
      buildCount: 1,
    },
  });

  await writeAuditLog({
    action: 'COMMUNITY_POST_CREATED',
    actorUserId: user.id,
    actorEmail: user.email,
    targetType: 'COMMUNITY_POST',
    targetId: created.id,
    metadata: { title: created.title, category: created.category, projectId },
  });

  return NextResponse.json({
    id: created.id,
    projectId: created.projectId,
    project_id: created.projectId,
    authorHandle: created.authorHandle,
    author_handle: created.authorHandle,
    title: created.title,
    summary: created.summary,
    description: created.description,
    category: created.category,
    modulesJson: created.modulesJson,
    score: created.score,
    buildCount: created.buildCount,
    build_count: created.buildCount,
    createdAt: created.createdAt.toISOString(),
    created_at: created.createdAt.toISOString(),
    post: {
      id: created.id,
      projectId: created.projectId,
      authorHandle: created.authorHandle,
      title: created.title,
      summary: created.summary,
      description: created.description,
      category: created.category,
      modulesJson: created.modulesJson,
      score: created.score,
      buildCount: created.buildCount,
      featured: created.featured,
      createdAt: created.createdAt.toISOString(),
    },
  });
}
