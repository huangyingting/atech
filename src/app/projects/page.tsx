'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface ProjectSummary {
  id: string;
  title: string;
  starred: boolean;
  phase: string;
  updatedAt: string;
  turns: Array<{ jobId: string; prompt: string }>;
  tree: {
    electronics?: {
      latest?: string;
      versions?: Record<
        string,
        {
          modules?: Array<{ instance_id: string; part_id: string; slot: string }>;
        }
      >;
    };
    firmware?: {
      latest?: string;
    };
  };
}

export default function ProjectsGalleryPage() {
  const router = useRouter();
  const { user, authHeaders, openAuthModal } = useApp();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'starred'>('all');
  const [anonDraftCount, setAnonDraftCount] = useState(0);
  const [creating, setCreating] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/projects', { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } finally {
      setLoading(false);
    }
  }, [user, authHeaders]);

  useEffect(() => {
    fetchProjects();
    try {
      const raw = JSON.parse(localStorage.getItem('p2p_anon_projects') || '[]');
      setAnonDraftCount(Array.isArray(raw) ? raw.length : 0);
    } catch {
      setAnonDraftCount(0);
    }
  }, [fetchProjects]);

  const handleClaimAnon = async () => {
    try {
      const raw = JSON.parse(localStorage.getItem('p2p_anon_projects') || '[]');
      if (!Array.isArray(raw) || raw.length === 0) return;
      for (const item of raw) {
        await fetch('/api/projects/anon/claim', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            title: item.title || 'Claimed Build',
            prompt: item.prompt || 'Build a custom hardware device',
          }),
        });
      }
      localStorage.removeItem('p2p_anon_projects');
      setAnonDraftCount(0);
      await fetchProjects();
    } catch {
      // ignore
    }
  };

  const handleToggleStar = async (projectId: string) => {
    const res = await fetch(`/api/projects/${projectId}/star`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (res.ok) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, starred: !p.starred } : p))
      );
    }
  };

  const handleDelete = async (projectId: string) => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  const handleNewProject = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: 'New Hardware Project',
          prompt: 'Create a desktop status monitor with OLED screen, rotary dial, and RGB LED.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.project) {
        router.push(`/projects/${data.project.id}/electronics`);
      }
    } finally {
      setCreating(false);
    }
  };

  const visibleProjects = projects.filter((p) =>
    filter === 'starred' ? p.starred : true
  );

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
          STUDIO WORKSPACE
        </div>
        <h1 className="text-3xl font-display font-bold">Sign in to view your projects</h1>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Your hardware topologies, 3D placements, and C++ firmware versions are saved to
          your invite-verified Atech account.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('login')}
            className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
          >
            Sign in / Redeem Invite
          </button>
          <Link
            href="/community"
            className="px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
          >
            Browse Public Community Builds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
            HARDWARE & FIRMWARE WORKSPACE
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Your Projects ({projects.length})
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {anonDraftCount > 0 && (
            <button
              onClick={handleClaimAnon}
              className="px-4 py-2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold"
            >
              Claim {anonDraftCount} Browser Draft{anonDraftCount > 1 ? 's' : ''}
            </button>
          )}
          <div className="flex rounded-full bg-zinc-100 dark:bg-zinc-900 p-1 text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-800 shadow-xs font-semibold'
                  : 'text-zinc-500'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilter('starred')}
              className={`px-3 py-1 rounded-full ${
                filter === 'starred'
                  ? 'bg-white dark:bg-zinc-800 shadow-xs font-semibold'
                  : 'text-zinc-500'
              }`}
            >
              ★ Starred ({projects.filter((p) => p.starred).length})
            </button>
          </div>
          <button
            onClick={handleNewProject}
            disabled={creating}
            data-testid="new-project-btn"
            className="px-4 py-2 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
          >
            {creating ? 'Creating...' : '+ New Project'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-zinc-400">
          Loading projects...
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-4">
          <h2 className="text-lg font-display font-bold">No projects yet</h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Describe a product in the AI Studio or fork a verified hardware build from the
            Community Hub.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/studio"
              className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
            >
              Describe a Product →
            </Link>
            <Link
              href="/community"
              className="px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
            >
              Explore Community Builds
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleProjects.map((proj) => {
            const latestVer = proj.tree?.electronics?.latest || 'v1';
            const mods =
              proj.tree?.electronics?.versions?.[latestVer]?.modules || [];

            return (
              <div
                key={proj.id}
                data-testid={`project-card-${proj.id}`}
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col justify-between hover:border-teal-500/60 transition"
              >
                <div>
                  {/* Isometric SVG Thumbnail */}
                  <Link
                    href={`/projects/${proj.id}/electronics`}
                    className="block bg-zinc-950 p-4 border-b border-zinc-800 relative group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                      <span>{mods.length} MODULES</span>
                      <span className="text-teal-400">{latestVer.toUpperCase()}</span>
                    </div>
                    <svg viewBox="0 0 280 110" className="w-full h-28">
                      <rect
                        x="20"
                        y="12"
                        width="240"
                        height="86"
                        rx="12"
                        fill="#064e3b"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                      {mods.slice(0, 6).map((m, idx) => (
                        <g
                          key={m.instance_id || idx}
                          transform={`translate(${34 + idx * 36}, 28)`}
                        >
                          <rect
                            width="30"
                            height="52"
                            rx="5"
                            fill="#0f172a"
                            stroke="#14b8a6"
                            strokeWidth="1.2"
                          />
                          <text
                            x="15"
                            y="28"
                            textAnchor="middle"
                            fill="#5eead4"
                            fontSize="7"
                            fontFamily="monospace"
                          >
                            {m.slot}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </Link>

                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/projects/${proj.id}/electronics`}
                        className="font-display font-bold text-lg hover:text-teal-600 transition"
                      >
                        {proj.title}
                      </Link>
                      <button
                        onClick={() => handleToggleStar(proj.id)}
                        data-testid={`star-project-${proj.id}`}
                        className={`text-base ${
                          proj.starred ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                        title="Toggle Star"
                      >
                        ★
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {mods.slice(0, 5).map((m, i) => (
                        <span
                          key={`${m.part_id}-${i}`}
                          className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-300"
                        >
                          {m.slot}: {m.part_id}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${proj.id}/electronics`}
                      className="font-semibold text-teal-600 hover:underline"
                    >
                      Electronics →
                    </Link>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <Link
                      href={`/projects/${proj.id}/firmware`}
                      className="font-semibold text-zinc-600 dark:text-zinc-400 hover:text-teal-600"
                    >
                      Firmware
                    </Link>
                  </div>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="text-zinc-400 hover:text-rose-500 text-[11px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
