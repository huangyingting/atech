'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  STUDIO_SHOWCASES,
  FULL_CATALOG_63_PARTS,
  BUILDER_QUOTES,
  COVERFLOW_SETUPS,
  CatalogPartNormalized,
} from '@/data/store-data';
import { BoardViewer3D } from '@/components/BoardViewer3D';
import { useApp } from '@/context/AppContext';

function StudioWorkbenchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authHeaders, openAuthModal, refreshUser } = useApp();

  const showcases = STUDIO_SHOWCASES;
  const [activeShowcaseId, setActiveShowcaseId] = useState(showcases[0].id);
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState('ALL');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [sourcingTier, setSourcingTier] = useState<'atech_only' | 'atech_preferred' | 'any_hardware'>('atech_preferred');
  const [selectedPart, setSelectedPart] = useState<CatalogPartNormalized | null>(null);
  const [turntableAngle, setTurntableAngle] = useState(25);
  const [dictating, setDictating] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [coverflowIdx, setCoverflowIdx] = useState(0);

  useEffect(() => {
    const sc = searchParams.get('showcase');
    if (sc && showcases.some((s) => s.id === sc)) {
      setActiveShowcaseId(sc);
      const found = showcases.find((s) => s.id === sc);
      if (found) setPrompt(found.prompt);
    }
    const pr = searchParams.get('prompt');
    if (pr) setPrompt(pr);
  }, [searchParams, showcases]);

  const activeShowcase =
    showcases.find((s) => s.id === activeShowcaseId) || showcases[0];

  const handleBuildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePrompt = prompt.trim() || activeShowcase.prompt;

    if (!user) {
      // Save draft in p2p_anon_projects for post-login claiming and open auth modal
      try {
        const existing = JSON.parse(
          localStorage.getItem('p2p_anon_projects') || '[]'
        );
        existing.unshift({
          title: effectivePrompt.slice(0, 48),
          prompt: effectivePrompt,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('p2p_anon_projects', JSON.stringify(existing.slice(0, 10)));
      } catch {
        // ignore storage errors
      }
      openAuthModal('login');
      return;
    }

    setCreating(true);
    try {
      const createRes = await fetch('/api/projects', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: effectivePrompt.slice(0, 50),
          prompt: effectivePrompt,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.project) {
        setCreating(false);
        return;
      }

      const projectId = createData.project.id;
      await fetch(`/api/projects/${projectId}/turn`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          prompt: effectivePrompt,
          phase: 'electronics',
        }),
      });
      await refreshUser();
      router.push(`/projects/${projectId}/electronics`);
    } finally {
      setCreating(false);
    }
  };

  const catalogParts = FULL_CATALOG_63_PARTS;
  const categories: string[] = [
    'ALL',
    ...Array.from(new Set(catalogParts.map((p) => p.category))),
  ];

  const filteredParts = catalogParts.filter((p) => {
    if (sourcingTier === 'atech_only' && p.tier !== 'atech') return false;
    const matchCat = catalogCategory === 'ALL' || p.category === catalogCategory;
    const matchSearch =
      !catalogSearch ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (p.kyCode || '').toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(catalogSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCoverflow = COVERFLOW_SETUPS[coverflowIdx] || COVERFLOW_SETUPS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* Studio Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 font-mono text-[11px] font-semibold">
            STUDIO WORKBENCH v2.4
          </span>
          <span className="text-xs text-zinc-500">
            Prompt → 14-Port 3D Electronics → ESP32-S3 C++ Firmware
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <Link
            href="/projects"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Your Projects
          </Link>
          <Link
            href="/community"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Community Hub
          </Link>
          <Link
            href="/learn-more"
            className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Learn more
          </Link>
        </div>
      </div>

      {/* Prompt-to-Product Hero & Interactive 3D Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
              AI HARDWARE & FIRMWARE SYNTHESIS
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight mt-1">
              Describe a device. Watch it come alive.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
              Type what your gadget should do or pick one of the 7 reference showcases.
              Studio selects the magnetic modules, maps the 14 motherboard slots, and
              writes the complete C++ firmware.
            </p>
          </div>

          <form onSubmit={handleBuildSubmit} className="space-y-3">
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 focus-within:border-teal-500 p-4 shadow-sm space-y-3">
              <textarea
                rows={4}
                data-testid="studio-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeShowcase.prompt}
                className="w-full bg-transparent text-sm focus:outline-hidden resize-none"
              />
              {attachedFileName && (
                <div className="flex items-center justify-between rounded-xl bg-teal-500/10 px-3 py-1.5 text-xs text-teal-700 dark:text-teal-300 font-mono">
                  <span>📎 Attached spec: {attachedFileName}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFileName(null)}
                    className="hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <label
                    id="attachbtn"
                    title="Attach reference image or spec"
                    className="cursor-pointer px-2.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    📎
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setAttachedFileName(f.name);
                      }}
                    />
                  </label>
                  <button
                    id="prompt-mic"
                    type="button"
                    onClick={() => {
                      if (dictating) {
                        setDictating(false);
                        return;
                      }
                      setDictating(true);
                      setTimeout(() => {
                        setPrompt(
                          'Build a smart CO2 and temperature desk monitor with a Color Display, CO2 sensor, and 3x3 LED Grid.'
                        );
                        setDictating(false);
                      }, 1200);
                    }}
                    title="Voice dictation"
                    className={`px-2.5 py-1.5 rounded-full border text-xs transition ${
                      dictating
                        ? 'border-rose-500 bg-rose-500 text-white animate-pulse'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    🎤 {dictating ? 'Listening…' : ''}
                  </button>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {user
                      ? `${user.creditsRemaining} credits available`
                      : 'Sign in with invite to synthesize'}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  data-testid="studio-generate-btn"
                  className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition"
                >
                  {creating ? 'Synthesizing Hardware + C++...' : 'Build Device →'}
                </button>
              </div>
            </div>
          </form>

          {/* 7 Interactive Showcase Switcher Pills */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              BUILT WITH THE KIT — CLICK TO PREVIEW IN 3D
            </div>
            <div className="flex flex-wrap gap-1.5">
              {showcases.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setActiveShowcaseId(sc.id);
                    setPrompt(sc.prompt);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    activeShowcaseId === sc.id
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-teal-500'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <BoardViewer3D
            title={`${activeShowcase.label} — ${activeShowcase.tagline}`}
            placements={
              activeShowcase.placements as Array<{
                instance_id: string;
                part_id: string;
                slot: string;
                rotation_deg?: number;
              }>
            }
            interactive={true}
            heightClass="h-[430px]"
          />
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold">{activeShowcase.label}:</span>{' '}
              <span className="text-zinc-500">{activeShowcase.description}</span>
            </div>
            <Link
              href={`/b/${activeShowcase.id}`}
              className="font-mono text-teal-600 font-semibold shrink-0 hover:underline"
            >
              Full Showcase Page →
            </Link>
          </div>
        </div>
      </div>

      {/* Builder Quotes Strip (#quotes) & 7-Build Coverflow (#setupflow) */}
      <section
        id="quotes"
        data-testid="studio-quotes-section"
        className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
              EARLY KIT BUILDERS
            </div>
            <h2 className="text-2xl font-display font-bold mt-1">
              What hardware builders are making with Atech
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/board?project=duet"
              className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold"
            >
              Inspect 3D Board Pinout →
            </Link>
            <Link
              href="/projects/duet/modules"
              className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold"
            >
              Open Full 63-Part Catalog →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILDER_QUOTES.map((q) => (
            <div
              key={q.id}
              className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between gap-4 shadow-xs"
            >
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
                &ldquo;{q.quote}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-zinc-900 text-white dark:bg-teal-500 dark:text-zinc-950 text-[11px] font-bold flex items-center justify-center">
                    {q.avatarInitials}
                  </span>
                  <div>
                    <div className="text-xs font-bold">{q.author}</div>
                    <div className="text-[11px] text-zinc-500">{q.role}</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 uppercase">{q.channel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 7-Build Coverflow Carousel (#setupflow) */}
        <div
          id="setupflow"
          data-testid="studio-coverflow-section"
          className="rounded-3xl bg-zinc-950 text-white p-6 sm:p-8 border border-zinc-800 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-teal-400">
                INTERACTIVE HARDWARE COVERFLOW · 7 SETUPS
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold mt-1">
                {activeCoverflow.title} — {activeCoverflow.caption}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCoverflowIdx(
                    (i) => (i - 1 + COVERFLOW_SETUPS.length) % COVERFLOW_SETUPS.length
                  )
                }
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => setCoverflowIdx((i) => (i + 1) % COVERFLOW_SETUPS.length)}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold"
              >
                Next →
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrompt(activeCoverflow.prompt);
                  if (
                    activeCoverflow.showcaseSlug &&
                    showcases.some((s) => s.id === activeCoverflow.showcaseSlug)
                  ) {
                    setActiveShowcaseId(activeCoverflow.showcaseSlug);
                  }
                }}
                className="px-4 py-1.5 rounded-full bg-teal-500 text-zinc-950 text-xs font-bold hover:bg-teal-400"
              >
                Load Setup into Prompt ↑
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {COVERFLOW_SETUPS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCoverflowIdx(idx);
                  setPrompt(item.prompt);
                }}
                className={`p-3 rounded-2xl border text-left transition ${
                  idx === coverflowIdx
                    ? 'border-teal-400 bg-teal-500/15 text-white scale-[1.02]'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <div className="font-bold text-xs text-white">{item.title}</div>
                <div className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                  {item.caption}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 63-Part Hardware Catalog Browser */}
      <section className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
              STUDIO COMPONENT LIBRARY
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mt-1">
              {catalogParts.length}-Part Hardware & Module Catalog
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              12 Atech snap-in modules, 14 off-the-shelf boards, and 37 kit sensors. Click any part to inspect its 3D CAD model or add it to your prompt.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Sourcing Tier Switcher */}
            <div className="flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-1 text-xs">
              <button
                type="button"
                onClick={() => setSourcingTier('atech_only')}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  sourcingTier === 'atech_only'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-zinc-500'
                }`}
              >
                Atech only (12)
              </button>
              <button
                type="button"
                onClick={() => setSourcingTier('atech_preferred')}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  sourcingTier === 'atech_preferred'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-zinc-500'
                }`}
              >
                Atech first (12+51)
              </button>
              <button
                type="button"
                onClick={() => setSourcingTier('any_hardware')}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  sourcingTier === 'any_hardware'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-zinc-500'
                }`}
              >
                Any hardware (63)
              </button>
            </div>
            <input
              type="search"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Filter 63 parts by name or KY..."
              className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs w-full sm:w-64"
            />
          </div>
        </div>

        {/* Inline 3D Module Turntable Preview Modal */}
        {selectedPart && (
          <div
            data-testid="studio-module-3d-preview"
            className="rounded-3xl border border-teal-500/40 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase text-teal-600">
                  {selectedPart.tierBadge} · 3D CAD TURNTABLE INSPECTOR
                </div>
                <h3 className="text-xl font-display font-bold mt-0.5">
                  {selectedPart.name} ({selectedPart.fullName})
                </h3>
                <p className="text-xs text-zinc-500 mt-1">{selectedPart.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPart(null)}
                className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 rounded-2xl bg-zinc-950 text-white p-6 flex flex-col items-center justify-center space-y-3">
                <div
                  className="h-28 w-44 rounded-2xl border-2 border-teal-400/60 bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center shadow-lg transition-transform"
                  style={{
                    transform: `perspective(480px) rotateX(20deg) rotateY(${turntableAngle}deg)`,
                  }}
                >
                  <span className="font-mono text-[10px] text-teal-400">
                    {selectedPart.tierBadge}
                  </span>
                  <span className="font-bold text-sm mt-1">{selectedPart.name}</span>
                  <span className="font-mono text-[10px] text-zinc-400 mt-0.5">
                    {selectedPart.sizeMm}
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={turntableAngle}
                  onChange={(e) => setTurntableAngle(Number(e.target.value))}
                  className="w-48 accent-teal-400"
                />
                <div className="font-mono text-[10px] text-zinc-400">
                  Drag slider to orbit 3D mesh · {selectedPart.sizeMm}
                </div>
              </div>

              <div className="md:col-span-7 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <div className="text-zinc-400 text-[10px] font-mono">INTERFACE</div>
                    <div className="font-mono font-bold mt-0.5">{selectedPart.interfaceType}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <div className="text-zinc-400 text-[10px] font-mono">PORTS USED</div>
                    <div className="font-mono font-bold mt-0.5">{selectedPart.portsUsed || 1}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <div className="text-zinc-400 text-[10px] font-mono">CURRENT</div>
                    <div className="font-mono font-bold mt-0.5">
                      {selectedPart.currentMa ? `${selectedPart.currentMa} mA` : '3.3V'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                    <div className="text-zinc-400 text-[10px] font-mono">DRIVER</div>
                    <div className="font-mono font-bold mt-0.5">{selectedPart.driver || 'GPIO'}</div>
                  </div>
                </div>

                {selectedPart.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPart.capabilities.map((c) => (
                      <span
                        key={c.id}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]"
                        title={c.description}
                      >
                        {c.id}()
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt((prev) =>
                        prev
                          ? `${prev.trim()} Include ${selectedPart.name} (${selectedPart.id}).`
                          : `Build a device using ${selectedPart.name} (${selectedPart.id}).`
                      );
                      setSelectedPart(null);
                    }}
                    className="px-4 py-2 rounded-full bg-teal-600 text-white font-semibold"
                  >
                    + Add {selectedPart.name} to Prompt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatalogCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase transition ${
                catalogCategory === cat
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
          {filteredParts.map((part) => (
            <div
              key={part.id}
              className="text-left rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 hover:border-teal-500 transition flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>{part.tierBadge}</span>
                  <span>{part.subline}</span>
                </div>
                <div className="font-display font-bold text-sm mt-1">{part.name}</div>
                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">
                  {part.description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedPart(part)}
                  className="text-zinc-600 dark:text-zinc-300 hover:underline font-semibold"
                >
                  Inspect 3D &amp; Specs
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrompt((prev) =>
                      prev
                        ? `${prev.trim()} Include ${part.name} (${part.id}).`
                        : `Build a device using ${part.name} (${part.id}).`
                    )
                  }
                  className="text-teal-600 font-semibold hover:underline"
                >
                  + Add to prompt
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono">Loading Studio Workbench...</div>}>
      <StudioWorkbenchContent />
    </Suspense>
  );
}
