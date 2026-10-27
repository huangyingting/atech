'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { BoardViewer3D } from '@/components/BoardViewer3D';

interface CommunityPostItem {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  upvoteCount: number;
  viewerVoted: boolean;
  authorHandle: string;
  authorName: string;
  modules: Array<{
    instance_id: string;
    part_id: string;
    slot: string;
    rotation_deg?: number;
  }>;
  firmwareCode?: string;
}

const COMMUNITY_CATEGORIES = [
  'All',
  'Games & audio',
  'Timers & productivity',
  'Sensors & environment',
  'Wearables',
  'Tools & controllers',
  'Other',
];

function CommunityHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authHeaders, openAuthModal } = useApp();

  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<'trending' | 'top' | 'new'>('trending');
  const [search, setSearch] = useState('');

  const [selectedPost, setSelectedPost] = useState<CommunityPostItem | null>(null);
  const [forkingId, setForkingId] = useState<string | null>(null);

  // Publish Modal State
  const [publishOpen, setPublishOpen] = useState(false);
  const [userProjects, setUserProjects] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [pubProjectId, setPubProjectId] = useState('');
  const [pubTitle, setPubTitle] = useState('');
  const [pubSummary, setPubSummary] = useState('');
  const [pubCategory, setPubCategory] = useState('Games & audio');
  const [pubTags, setPubTags] = useState('esp32, oled, modular');
  const [publishing, setPublishing] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        category,
        sort,
        q: search,
      });
      const res = await fetch(`/api/community/posts?${qs.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } finally {
      setLoading(false);
    }
  }, [category, sort, search, authHeaders]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const pub = searchParams.get('publish');
    if (pub && user) {
      setPubProjectId(pub);
      setPublishOpen(true);
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (publishOpen && user) {
      fetch('/api/projects', { headers: authHeaders() })
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.projects)) {
            setUserProjects(d.projects);
            if (!pubProjectId && d.projects[0]) {
              setPubProjectId(d.projects[0].id);
              setPubTitle(d.projects[0].title);
            }
          }
        })
        .catch(() => null);
    }
  }, [publishOpen, user, authHeaders, pubProjectId]);

  const handleVote = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    const res = await fetch(`/api/community/posts/${postId}/vote`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, upvoteCount: data.upvoteCount, viewerVoted: data.voted }
            : p
        )
      );
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) =>
          prev
            ? { ...prev, upvoteCount: data.upvoteCount, viewerVoted: data.voted }
            : null
        );
      }
    }
  };

  const handleForkBuild = async (postId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setForkingId(postId);
    try {
      const res = await fetch(`/api/community/posts/${postId}/build`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.project?.id) {
        router.push(`/projects/${data.project.id}/electronics`);
      }
    } finally {
      setForkingId(null);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          projectId: pubProjectId || undefined,
          title: pubTitle,
          summary: pubSummary,
          category: pubCategory,
          tags: pubTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        setPublishOpen(false);
        setPubTitle('');
        setPubSummary('');
        await loadPosts();
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
            OPEN HARDWARE REGISTRY
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold mt-1">
            Community Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
            Explore hardware + C++ firmware builds created by the Atech community. Inspect
            any build in 3D or click &ldquo;Build →&rdquo; to fork it directly into your Studio
            workspace.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              openAuthModal('login');
              return;
            }
            setPublishOpen(true);
          }}
          data-testid="post-build-btn"
          className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
        >
          + Post a build
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {COMMUNITY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                category === cat
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'trending' | 'top' | 'new')}
            className="px-3 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium"
          >
            <option value="trending">Trending</option>
            <option value="top">Most Upvoted</option>
            <option value="new">Newest</option>
          </select>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search community builds..."
            className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs flex-1 sm:w-56"
          />
        </div>
      </div>

      {/* Community Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-zinc-400">
          Loading community builds...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              data-testid={`community-card-${post.id}`}
              onClick={() => setSelectedPost(post)}
              className="cursor-pointer rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-teal-500 transition flex flex-col justify-between"
            >
              <div>
                <div className="bg-zinc-950 p-4 border-b border-zinc-800">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                    <span>{post.category.toUpperCase()}</span>
                    <span className="text-teal-400">{post.modules.length} MODULES</span>
                  </div>
                  <svg viewBox="0 0 280 105" className="w-full h-28">
                    <rect
                      x="18"
                      y="10"
                      width="244"
                      height="84"
                      rx="12"
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="1.5"
                    />
                    {post.modules.slice(0, 6).map((m, idx) => (
                      <g
                        key={`${m.slot}-${idx}`}
                        transform={`translate(${32 + idx * 36}, 26)`}
                      >
                        <rect
                          width="30"
                          height="50"
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
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>{post.authorHandle}</span>
                    <span>{post.tags.slice(0, 2).map((t) => `#${t}`).join(' ')}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl">{post.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleVote(e, post.id)}
                  data-testid={`vote-post-${post.id}`}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 transition ${
                    post.viewerVoted
                      ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                      : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <span>♥</span>
                  <span>{post.upvoteCount}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleForkBuild(post.id);
                  }}
                  data-testid={`fork-post-${post.id}`}
                  className="px-4 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90"
                >
                  {forkingId === post.id ? 'Forking...' : 'Build →'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="w-full max-w-4xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-teal-600 uppercase">
                  {selectedPost.category} • BY {selectedPost.authorHandle}
                </div>
                <h2 className="text-2xl font-display font-bold mt-0.5">
                  {selectedPost.title}
                </h2>
                <p className="text-xs text-zinc-500 mt-1">{selectedPost.summary}</p>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold"
              >
                Close ✕
              </button>
            </div>

            <BoardViewer3D
              title={`${selectedPost.title} — Interactive 3D & Hardware Emulator`}
              placements={selectedPost.modules}
              interactive={true}
              heightClass="h-[360px]"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleVote(e, selectedPost.id)}
                  className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-semibold"
                >
                  ♥ Upvote ({selectedPost.upvoteCount})
                </button>
              </div>

              <button
                onClick={() => handleForkBuild(selectedPost.id)}
                data-testid="modal-fork-build-btn"
                className="px-6 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
              >
                {forkingId === selectedPost.id
                  ? 'Forking into Studio...'
                  : 'Build → (Fork into Your Projects)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post a Build Modal */}
      {publishOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={() => setPublishOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">
                Post a build to Community Hub
              </h2>
              <button
                onClick={() => setPublishOpen(false)}
                className="text-xs text-zinc-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-3 text-xs">
              {userProjects.length > 0 && (
                <div>
                  <label className="block font-semibold mb-1">
                    Select Studio Project
                  </label>
                  <select
                    value={pubProjectId}
                    onChange={(e) => {
                      setPubProjectId(e.target.value);
                      const found = userProjects.find((p) => p.id === e.target.value);
                      if (found) setPubTitle(found.title);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    {userProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Build Title</label>
                <input
                  type="text"
                  required
                  value={pubTitle}
                  onChange={(e) => setPubTitle(e.target.value)}
                  placeholder="Solar Desk Telemetry Node"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Summary</label>
                <textarea
                  rows={3}
                  required
                  value={pubSummary}
                  onChange={(e) => setPubSummary(e.target.value)}
                  placeholder="Describe what your build does and which modules it uses..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={pubCategory}
                    onChange={(e) => setPubCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  >
                    {COMMUNITY_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={pubTags}
                    onChange={(e) => setPubTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold"
              >
                {publishing ? 'Publishing...' : 'Publish to Community Hub'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono">Loading Community Hub...</div>}>
      <CommunityHubContent />
    </Suspense>
  );
}
