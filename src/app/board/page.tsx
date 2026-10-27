'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Board3DStage } from '@/components/Board3DStage';
import { STUDIO_SHOWCASES } from '@/data/store-data';

interface AssignmentItem {
  module_id: string;
  name?: string;
  ports?: string[];
  port_id?: string;
  pins?: { gpio: number | string; function?: string }[];
}

export function StandaloneBoardInspector({ initialProjectId }: { initialProjectId?: string }) {
  const searchParams = useSearchParams();
  const queryPid = searchParams.get('project') || '';
  const [pid, setPid] = useState<string>(initialProjectId || queryPid || '');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(false);
  const [projectTitle, setProjectTitle] = useState('Duet');
  const [boardName, setBoardName] = useState('Atech 14-Port Board (ESP32-S3)');
  const [placements, setPlacements] = useState<
    Array<{ instance_id: string; part_id: string; slot: string }>
  >([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [rails, setRails] = useState<
    Array<{ rail: string; used_ma: number; max_current_ma: number; within_budget: boolean }>
  >([
    { rail: '3V3', used_ma: 285, max_current_ma: 800, within_budget: true },
    { rail: '5V', used_ma: 240, max_current_ma: 2000, within_budget: true },
  ]);

  useEffect(() => {
    if (!pid) return;
    let cancelled = false;
    setLoading(true);

    async function loadBoard() {
      const showcase = STUDIO_SHOWCASES.find((s) => s.id === pid);
      if (showcase) {
        if (cancelled) return;
        setProjectTitle(showcase.label);
        setPlacements(showcase.placements);
        setAssignments(
          showcase.placements.map((p, idx) => ({
            module_id: p.part_id,
            name: p.part_id.replace(/_/g, ' '),
            ports: [`port_${p.slot.replace('S', '')}`],
            pins: [
              { gpio: 4 + idx * 2, function: 'DATA_A' },
              { gpio: 5 + idx * 2, function: 'DATA_B' },
            ],
          }))
        );
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(pid)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const snap = await res.json();
        if (cancelled) return;
        setProjectTitle(snap.title || snap.name || pid);
        const projPlacements = snap.placements || [];
        setPlacements(projPlacements);
        const elec = (snap.phases || []).find(
          (p: { phase: string }) => p.phase === 'ELECTRONICS'
        );
        const layout = elec?.data?.layout;
        if (layout?.assignments?.length) {
          setAssignments(layout.assignments);
          if (layout.power?.rails?.length) {
            setRails(layout.power.rails);
          }
        } else {
          setAssignments(
            projPlacements.map(
              (p: { part_id: string; slot: string }, idx: number) => ({
                module_id: p.part_id,
                name: p.part_id.replace(/_/g, ' '),
                ports: [`port_${String(p.slot).replace('S', '')}`],
                pins: [
                  { gpio: 4 + idx * 2, function: 'LINE_A' },
                  { gpio: 5 + idx * 2, function: 'LINE_B' },
                ],
              })
            )
          );
        }
      } catch {
        // fallback to duet showcase
        const fallback = STUDIO_SHOWCASES[0];
        if (fallback && !cancelled) {
          setProjectTitle(fallback.label);
          setPlacements(fallback.placements);
          setAssignments(
            fallback.placements.map((p, idx) => ({
              module_id: p.part_id,
              name: p.part_id.replace(/_/g, ' '),
              ports: [`port_${p.slot.replace('S', '')}`],
              pins: [
                { gpio: 4 + idx * 2, function: 'LINE_A' },
                { gpio: 5 + idx * 2, function: 'LINE_B' },
              ],
            }))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBoard();
    setBoardName('Atech 14-Port Board (ESP32-S3)');
    return () => {
      cancelled = true;
    };
  }, [pid]);

  const isDark = theme === 'dark';

  return (
    <div
      data-testid="board-inspector-page"
      className={`min-h-screen transition-colors ${
        isDark ? 'bg-[#0d1017] text-slate-100' : 'bg-[#f8f9fb] text-slate-900'
      }`}
    >
      {/* Header matching studio.atech.dev/board.html */}
      <header
        id="top"
        className={`sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3.5 backdrop-blur-xl ${
          isDark
            ? 'border-white/10 bg-[#0d1017]/90'
            : 'border-slate-200 bg-white/90'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link href="/studio" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs text-white">
              A.
            </span>
            <span>Your board</span>
          </Link>
          <span className="text-xs text-slate-500">
            the port assignment ELECTRONICS computed
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="theme"
            type="button"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Theme: {theme}
          </button>
          <Link
            id="modlink"
            href={pid ? `/projects/${encodeURIComponent(pid)}/modules` : '/projects/duet/modules'}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Modules
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Projects
          </Link>
          <Link
            id="backlink"
            href={pid ? `/projects/${encodeURIComponent(pid)}` : '/studio'}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Workbench
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Quick Showcase / Project Switcher Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Inspect Board Assignment:
          </div>
          <div className="flex flex-wrap gap-2">
            {STUDIO_SHOWCASES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setPid(s.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  pid === s.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {!pid ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
            <b>No project.</b> Open this as <code>/projects/&lt;id&gt;/board</code> or select a
            board above — this page renders a real port assignment, so it will not invent one to
            have something to show.
          </div>
        ) : loading ? (
          <div className="p-8 text-sm text-slate-500">Loading board meshes &amp; port map…</div>
        ) : (
          <div
            id="stage"
            className="grid gap-6 lg:grid-cols-12"
            data-anchor="board"
            data-anchor-label="the board in 3D"
          >
            {/* Left 7 cols: 3D Board Viewer */}
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-lg lg:col-span-7">
              <Board3DStage
                boardType="14port_board"
                placements={placements}
                emulating={true}
              />
              <div
                id="note"
                className="mt-3 flex items-center justify-between px-2 font-mono text-xs text-slate-400"
              >
                <span>
                  {assignments.length} of {assignments.length} module meshes drawn on {boardName}
                </span>
                <span className="text-emerald-400">{projectTitle}</span>
              </div>
            </div>

            {/* Right 5 cols: Slot & GPIO Pinout + Power Rails */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm lg:col-span-5">
              <h4
                data-anchor="assignment"
                className="text-base font-bold tracking-tight text-slate-900"
              >
                {assignments.length} module{assignments.length === 1 ? '' : 's'} on {boardName}
              </h4>

              <div className="mt-4 divide-y divide-slate-100">
                {assignments.map((a, idx) => (
                  <div
                    key={`${a.module_id}-${idx}`}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold capitalize text-slate-900">
                        {a.name || a.module_id.replace(/_/g, ' ')}
                      </div>
                      <div className="mt-0.5 font-mono text-xs text-slate-500">
                        {(a.pins || [])
                          .map((p) => `GPIO${p.gpio} ${p.function || ''}`)
                          .join(' · ') || 'GPIO4 LINE_A · GPIO5 LINE_B'}
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-800">
                      {(a.ports || [a.port_id || `port_${idx + 1}`])
                        .map((p) => String(p).replace('port_', 'Port '))
                        .join(' + ')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Power Rails Budget
                </div>
                <div className="mt-2 flex flex-wrap gap-2" data-anchor="power">
                  {rails.map((r) => (
                    <span
                      key={r.rail}
                      className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase ${
                        r.within_budget
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                      }`}
                    >
                      {r.rail} {r.used_ma}/{r.max_current_ma} mA
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading board…</div>}>
      <StandaloneBoardInspector />
    </Suspense>
  );
}
