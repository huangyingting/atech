'use client';

import React, { useState, useMemo, use } from 'react';
import Link from 'next/link';
import { FULL_CATALOG_63_PARTS, CatalogPartNormalized } from '@/data/store-data';

const FACET_ORDER = [
  { id: 'all', label: 'All' },
  { id: 'sensor', label: 'Sensor' },
  { id: 'led', label: 'Light' },
  { id: 'input', label: 'Input' },
  { id: 'audio', label: 'Audio' },
  { id: 'actuator', label: 'Actuator' },
  { id: 'display', label: 'Display' },
  { id: 'boards', label: 'Boards' },
];

export default function ProjectModulesCatalogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [query, setQuery] = useState('');
  const [sourcing, setSourcing] = useState<'atech_only' | 'atech_preferred' | 'any_hardware'>(
    'atech_preferred'
  );
  const [category, setCategory] = useState('all');
  const [selectedPart, setSelectedPart] = useState<CatalogPartNormalized | null>(null);
  const [previewMode, setPreviewMode] = useState<'render' | '3d'>('3d');
  const [turntableAngle, setTurntableAngle] = useState(28);
  const [savedBadge, setSavedBadge] = useState<string | null>(null);
  const [showSourcingHelp, setShowSourcingHelp] = useState(false);

  const tierFiltered = useMemo(() => {
    return FULL_CATALOG_63_PARTS.filter((part) => {
      if (sourcing === 'atech_only' && part.tier !== 'atech') return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${part.name} ${part.fullName} ${part.description} ${part.kyCode || ''} ${part.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sourcing, query]);

  const visibleParts = useMemo(() => {
    if (category === 'all') return tierFiltered;
    return tierFiltered.filter((p) => p.category === category);
  }, [tierFiltered, category]);

  const countsByCat = useMemo(() => {
    const map: Record<string, number> = { all: tierFiltered.length };
    for (const p of tierFiltered) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return map;
  }, [tierFiltered]);

  const handleSourcingChange = async (
    nextMode: 'atech_only' | 'atech_preferred' | 'any_hardware'
  ) => {
    setSourcing(nextMode);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/settings/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcing: nextMode }),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedBadge(
          data.staled?.length
            ? `saved · ${data.staled.join(', ')} now stale`
            : 'saved'
        );
        setTimeout(() => setSavedBadge(null), 2800);
      }
    } catch {
      // ignore offline
    }
  };

  return (
    <div
      data-testid="modules-catalog-page"
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-[#0d1017] text-white' : 'bg-[#f8f9fb] text-slate-900'
      }`}
    >
      {/* Header matching studio.atech.dev/modules.html */}
      <header
        id="top"
        className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-6 py-3.5 text-slate-900 backdrop-blur-xl"
      >
        <Link href="/studio" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs text-white">
            A.
          </span>
          <b>Atech modules</b>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          {savedBadge && (
            <span
              id="saved"
              className="rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-semibold text-emerald-800"
            >
              {savedBadge}
            </span>
          )}
          <button
            id="theme"
            type="button"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Theme: {theme}
          </button>
          <Link
            id="backlink"
            href={`/projects/${encodeURIComponent(projectId)}`}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Workbench
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Projects
          </Link>
          <Link
            id="boardlink"
            href={`/projects/${encodeURIComponent(projectId)}/board`}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Board
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hardware catalog</h1>
          <p className="mt-1 text-sm text-slate-500">
            63 parts · 12 Atech modules that clip into the Atech 14-Port Board, 14 off-the-shelf
            boards, 37 kit parts
          </p>
        </div>

        {/* Sticky Catalog Filter Bar (.mc-bar) */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[260px] flex-1">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 63 parts — name, KY no..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none"
              />
              <span className=" absolute right-3 top-2.5 rounded-full bg-slate-200/70 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                {visibleParts.length}
              </span>
            </div>

            {/* 3-Tier Sourcing Segmented Control */}
            <div className="flex flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleSourcingChange('atech_only')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  sourcing === 'atech_only'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Atech only <span className="ml-1 opacity-70">12</span>
              </button>
              <button
                type="button"
                onClick={() => handleSourcingChange('atech_preferred')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  sourcing === 'atech_preferred'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Atech first <span className="ml-1 opacity-70">12 + 51</span>
              </button>
              <button
                type="button"
                data-testid="sourcing-mode-any"
                onClick={() => handleSourcingChange('any_hardware')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  sourcing === 'any_hardware'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Any hardware <span className="ml-1 opacity-70">63</span>
              </button>
            </div>
          </div>

          {/* Category Facet Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {FACET_ORDER.map((facet) => {
              const count = countsByCat[facet.id] || 0;
              if (facet.id !== 'all' && count === 0) return null;
              const active = category === facet.id;
              return (
                <button
                  key={facet.id}
                  type="button"
                  onClick={() => setCategory(facet.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {facet.label}{' '}
                  <span className="ml-0.5 font-mono text-[11px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setShowSourcingHelp((v) => !v)}
              className="underline decoration-slate-300 underline-offset-2 hover:text-slate-800"
            >
              What ‘Atech only’, ‘Atech first’ and ‘Any hardware’ mean ▾
            </button>
            <span>·</span>
            <span>
              Project: <strong className="text-slate-700">{projectId}</strong> — changes save
              automatically to project inventory settings.
            </span>
          </div>

          {showSourcingHelp && (
            <div className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 sm:grid-cols-3">
              <div>
                <b className="text-slate-900">Atech only (12):</b> Restricts ELECTRONICS to the 12
                plug-and-play modules that clip directly into the Atech 14-Port Board.
              </div>
              <div>
                <b className="text-slate-900">Atech first (12 + 51):</b> Prefers Atech snap-in
                modules whenever one fits, and reaches into the 51 off-the-shelf parts only when
                needed.
              </div>
              <div>
                <b className="text-slate-900">Any hardware (63):</b> Allows any controller board
                (Raspberry Pi, Arduino, ESP32 DevKit) and any soldered 37-in-1 KY sensor.
              </div>
            </div>
          )}
        </div>

        {/* Inline 3D Module Turntable Preview Drawer (matches screenshot 97) */}
        {selectedPart && (
          <div
            id="module-preview-drawer"
            data-testid="inline-module-3d-preview"
            className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {selectedPart.category.toUpperCase()}
                </div>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{selectedPart.name}</h2>
                <p className="text-sm text-slate-500">{selectedPart.fullName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPart(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close module preview"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-12">
              {/* Left 6 cols: Render | 3D model toggle + interactive turntable */}
              <div className="lg:col-span-6">
                <div className="mb-3 inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('render')}
                    className={`rounded-full px-3 py-1 ${
                      previewMode === 'render'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    Render
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('3d')}
                    className={`rounded-full px-3 py-1 ${
                      previewMode === '3d'
                        ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                        : 'text-slate-600'
                    }`}
                  >
                    3D model
                  </button>
                </div>

                <div className="flex flex-col items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div
                    className="my-6 flex h-36 w-52 items-center justify-center rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-2xl transition-transform duration-200"
                    style={{
                      transform:
                        previewMode === '3d'
                          ? `perspective(500px) rotateX(22deg) rotateY(${turntableAngle}deg)`
                          : 'none',
                    }}
                  >
                    <div className="text-center">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                        {selectedPart.tierBadge}
                      </div>
                      <div className="mt-1 text-sm font-bold">{selectedPart.name}</div>
                      <div className="mt-1 font-mono text-[11px] text-slate-400">
                        {selectedPart.sizeMm}
                      </div>
                    </div>
                  </div>

                  {previewMode === '3d' && (
                    <div className="w-full max-w-xs">
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        value={turntableAngle}
                        onChange={(e) => setTurntableAngle(Number(e.target.value))}
                        className="w-full accent-slate-900"
                      />
                    </div>
                  )}

                  <div className="mt-2 font-mono text-[11px] text-slate-500">
                    11,018 triangles · {selectedPart.sizeMm} measured from the mesh
                  </div>
                </div>
              </div>

              {/* Right 6 cols: Technical Metadata Table */}
              <div className="divide-y divide-slate-100 text-sm lg:col-span-6">
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-500">Interface</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {selectedPart.interfaceType}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-500">Ports</span>
                  <span className="font-medium text-slate-900">
                    {selectedPart.portsUsed === 2
                      ? 'Takes 2 adjacent ports; needs a port carrying digital'
                      : selectedPart.portsUsed === 1
                      ? `Takes 1 port; needs a port carrying ${selectedPart.interfaceType}`
                      : 'Standalone controller board'}
                  </span>
                </div>
                {selectedPart.currentMa !== null && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-500">Current</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {selectedPart.currentMa} mA
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-500">Size</span>
                  <span className="font-mono text-slate-900">
                    {selectedPart.sizeMm} (CAD bounding box)
                  </span>
                </div>
                {selectedPart.driver && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-slate-500">Driver</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {selectedPart.driver}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-slate-600">
              {selectedPart.description}
            </p>

            {selectedPart.capabilities.length > 0 && (
              <div className="mt-6">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                  WHAT IT CAN DO
                </div>
                <div className="mt-3 space-y-2">
                  {selectedPart.capabilities.map((cap) => (
                    <div
                      key={cap.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs"
                    >
                      <code className="font-mono font-bold text-slate-900">{cap.id}</code>{' '}
                      <span className="ml-2 text-slate-600">{cap.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 63-Part Hardware Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleParts.map((part) => (
            <button
              key={part.id}
              id={`m-${part.id}`}
              data-testid={`catalog-card-${part.id}`}
              type="button"
              onClick={() => setSelectedPart(part)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 text-left text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
            >
              <div>
                <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-white">
                  {part.recommended && (
                    <span className="absolute left-2 top-2 rounded-full bg-teal-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                      recommended
                    </span>
                  )}
                  {part.portsUsed === 2 && (
                    <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-slate-200">
                      2 ports
                    </span>
                  )}
                  <div className="text-center">
                    <div className="font-mono text-[10px] text-slate-400">
                      {part.kyCode || part.tier.toUpperCase()}
                    </div>
                    <div className="mt-1 px-2 text-xs font-semibold text-white">{part.name}</div>
                  </div>
                </div>

                <div className="mt-3 font-mono text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  {part.tierBadge}
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-900">{part.name}</div>
              </div>

              <div className="mt-3 pt-2">
                <div className="font-mono text-xs text-slate-500">{part.subline}</div>
                {part.priceDisplay && (
                  <div className="mt-1 font-mono text-sm font-bold text-slate-900">
                    {part.priceDisplay}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
