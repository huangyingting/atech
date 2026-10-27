'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { BoardViewer3D } from '@/components/BoardViewer3D';
import { CATALOG_PARTS } from '@/data/store-data';

interface TurnItem {
  jobId: string;
  prompt: string;
  phase: string;
  summary: string;
  version: string;
  createdAt: string;
  rating?: number;
}

interface PlacementItem {
  instance_id: string;
  part_id: string;
  slot: string;
  rotation_deg?: number;
}

export default function ProjectEditorPage() {
  const params = useParams<{ id: string; phase?: string[] }>();
  const router = useRouter();
  const { authHeaders, refreshUser } = useApp();

  const projectId = params.id;
  const rawPhase = params.phase?.[0]?.toLowerCase();
  const initialPhase: 'electronics' | 'firmware' | 'wifi' =
    rawPhase === 'firmware' ? 'firmware' : rawPhase === 'wifi' ? 'wifi' : 'electronics';

  const [phase, setPhase] = useState<'electronics' | 'firmware' | 'wifi'>(initialPhase);
  const [editorMode, setEditorMode] = useState<'simple' | 'advanced'>('simple');
  const [firmwareTab, setFirmwareTab] = useState<'code' | 'flash' | 'midi' | 'wifi'>('code');
  const [activeFwFile, setActiveFwFile] = useState<
    'sketch.ino' | 'transport.h' | 'wifi_gateway.h' | 'midi_flash.cpp' | 'platformio.ini' | 'README.md'
  >('sketch.ino');

  const [title, setTitle] = useState('Loading project...');
  const [starred, setStarred] = useState(false);
  const [turns, setTurns] = useState<TurnItem[]>([]);
  const [placements, setPlacements] = useState<PlacementItem[]>([]);
  const [code, setCode] = useState('');
  const [version, setVersion] = useState('v1');
  const [versionsList, setVersionsList] = useState<string[]>(['v1']);

  const [promptInput, setPromptInput] = useState('');
  const [synthesizing, setSynthesizing] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [dictating, setDictating] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Parameter Tune Panel (#tunepanel)
  const [ledBrightnessCap, setLedBrightnessCap] = useState(20);
  const [sampleRateHz, setSampleRateHz] = useState(30);
  const [wifiSsid, setWifiSsid] = useState('Atech_Lab_2.4G');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiProvisioned, setWifiProvisioned] = useState(false);

  // Advanced Slot Editor state
  const [newSlot, setNewSlot] = useState('S5');
  const [newPartId, setNewPartId] = useState('button');

  // WebSerial Flasher state
  const [flashLogs, setFlashLogs] = useState<string[]>([]);
  const [flashing, setFlashing] = useState(false);

  // WiFi Gateway Tester state
  const [wifiEndpoint, setWifiEndpoint] = useState('/command');
  const [wifiPayload, setWifiPayload] = useState('{"action":"beep","freq_hz":880}');
  const [wifiResponse, setWifiResponse] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return;
    const data = await res.json();
    const p = data.project;
    if (!p) return;

    setTitle(p.title);
    setStarred(Boolean(p.starred));
    setTurns(Array.isArray(p.turns) ? p.turns : []);

    const elecLatest = p.tree?.electronics?.latest || 'v1';
    const elecVersions = Object.keys(p.tree?.electronics?.versions || { v1: {} });
    setVersion(elecLatest);
    setVersionsList(elecVersions);

    const mods = p.tree?.electronics?.versions?.[elecLatest]?.modules || [];
    setPlacements(mods);

    const fwLatest = p.tree?.firmware?.latest || elecLatest;
    const fwCode =
      p.tree?.firmware?.versions?.[fwLatest]?.files?.['sketch.ino'] ||
      p.tree?.firmware?.versions?.[fwLatest]?.code ||
      '// Synthesize a turn to generate ESP32-S3 C++ firmware';
    setCode(fwCode);
  }, [projectId, authHeaders]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handlePhaseSwitch = (nextPhase: 'electronics' | 'firmware' | 'wifi') => {
    setPhase(nextPhase);
    router.replace(`/projects/${projectId}/${nextPhase}`);
  };

  const handleTurnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    setSynthesizing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/turn`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          prompt: promptInput,
          phase,
        }),
      });
      if (res.ok) {
        setPromptInput('');
        await loadProject();
        await refreshUser();
      }
    } finally {
      setSynthesizing(false);
    }
  };

  const handleRateTurn = async (jobId: string, rating: 1 | -1) => {
    setRatings((prev) => ({ ...prev, [jobId]: rating }));
    await fetch(`/api/projects/${projectId}/turns/${jobId}/rating`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ rating }),
    });
  };

  const handleAddPlacement = async () => {
    const updated = [
      ...placements.filter((p) => p.slot !== newSlot),
      {
        instance_id: `${newPartId}_${Date.now().toString(36)}`,
        part_id: newPartId,
        slot: newSlot,
        rotation_deg: 0,
      },
    ];
    setPlacements(updated);
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        title,
        placements: updated,
      }),
    });
  };

  const handleRemovePlacement = async (slot: string) => {
    const updated = placements.filter((p) => p.slot !== slot);
    setPlacements(updated);
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        title,
        placements: updated,
      }),
    });
  };

  const handleSimulateFlash = async () => {
    setFlashing(true);
    setFlashLogs([
      '[00:00.1] Connecting to ESP32-S3 over USB CDC/JTAG (115200 baud)...',
      '[00:00.4] Detected chip: ESP32-S3 (QFN56, rev v0.2, 8MB PSRAM, 16MB Flash)',
      `[00:00.9] Compiling ${title} (${placements.length} modules mapped)...`,
      '[00:01.6] Writing partitions: bootloader.bin (0x0), firmware.bin (0x10000)...',
      '[00:02.3] Hash of data verified. Hard resetting via RTS pin... Done!',
    ]);
    setTimeout(() => setFlashing(false), 900);
  };

  const handleWifiSend = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedPayload: unknown = wifiPayload;
    try {
      parsedPayload = JSON.parse(wifiPayload);
    } catch {
      // send raw string if not JSON
    }
    const res = await fetch(`/api/projects/${projectId}/device/send`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        endpoint: wifiEndpoint,
        payload: parsedPayload,
      }),
    });
    const data = await res.json();
    setWifiResponse(JSON.stringify(data, null, 2));
  };

  const handleDownloadIno = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${version}.ino`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Project Editor Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            ← Projects
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() =>
              fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ title }),
              })
            }
            className="font-display font-bold text-base bg-transparent border-b border-transparent focus:border-teal-500 focus:outline-hidden"
          />
          <button
            onClick={async () => {
              setStarred(!starred);
              await fetch(`/api/projects/${projectId}/star`, {
                method: 'POST',
                headers: authHeaders(),
              });
            }}
            className={`text-sm ${starred ? 'text-amber-400' : 'text-zinc-400'}`}
            title="Star project"
          >
            ★
          </button>
        </div>

        {/* Center Phase Switcher: ELECTRONICS vs FIRMWARE vs WIFI */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-semibold">
          <button
            onClick={() => handlePhaseSwitch('electronics')}
            data-testid="phase-tab-electronics"
            className={`px-4 py-1.5 rounded-full transition ${
              phase === 'electronics'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                : 'text-zinc-500'
            }`}
          >
            1. ELECTRONICS ({placements.length})
          </button>
          <button
            onClick={() => handlePhaseSwitch('firmware')}
            data-testid="phase-tab-firmware"
            className={`px-4 py-1.5 rounded-full transition ${
              phase === 'firmware'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                : 'text-zinc-500'
            }`}
          >
            2. FIRMWARE ({version})
          </button>
          <button
            onClick={() => handlePhaseSwitch('wifi')}
            data-testid="phase-tab-wifi"
            className={`px-4 py-1.5 rounded-full transition ${
              phase === 'wifi'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                : 'text-zinc-500'
            }`}
          >
            3. WIFI
          </button>
        </div>

        {/* Right Controls: Simple vs Advanced Toggle + Board & Modules links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${projectId}/board`}
            className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Board 3D
          </Link>
          <Link
            href={`/projects/${projectId}/modules`}
            className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Modules (63)
          </Link>
          <div className="flex items-center gap-1 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setEditorMode('simple')}
              data-testid="mode-simple"
              className={`px-3 py-1 rounded-full ${
                editorMode === 'simple'
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-zinc-500'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setEditorMode('advanced')}
              data-testid="mode-advanced"
              className={`px-3 py-1 rounded-full ${
                editorMode === 'advanced'
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-zinc-500'
              }`}
            >
              Advanced
            </button>
          </div>
          <Link
            href={`/community?publish=${projectId}`}
            className="px-3.5 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Share Build
          </Link>
        </div>
      </div>

      {/* Main Split Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: AI Synthesis Chat & Version History */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between min-h-[540px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase text-teal-600">
                  AI HARDWARE COPILOT
                </div>
                <div className="font-display font-bold text-sm">
                  Design & Firmware History
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px]">
                {versionsList.length} rev{versionsList.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {turns.length === 0 ? (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-500">
                  Describe a modification below to synthesize updated 14-port module
                  placements and ESP32-S3 C++ firmware.
                </div>
              ) : (
                turns.map((t) => (
                  <div
                    key={t.jobId}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>{t.phase.toUpperCase()}</span>
                      <span>{t.version || 'v1'}</span>
                    </div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      &ldquo;{t.prompt}&rdquo;
                    </div>
                    {t.summary && (
                      <div className="text-zinc-500 text-[11px] leading-relaxed">
                        {t.summary}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50 text-[10px]">
                      <span className="text-zinc-400">Rate synthesis quality:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRateTurn(t.jobId, 1)}
                          className={`px-2 py-0.5 rounded-md border ${
                            ratings[t.jobId] === 1
                              ? 'border-teal-500 bg-teal-500/10 text-teal-600'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-400'
                          }`}
                        >
                          👍
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRateTurn(t.jobId, -1)}
                          className={`px-2 py-0.5 rounded-md border ${
                            ratings[t.jobId] === -1
                              ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-400'
                          }`}
                        >
                          👎
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleTurnSubmit} className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {/* Suggested Next Moves Chips (#movesrow) */}
            <div id="movesrow" className="flex flex-wrap gap-1.5">
              {[
                'Add a 3x3 LED Grid alert',
                'Expose WiFi JSON command',
                'Show live chart on Color Screen',
              ].map((move) => (
                <button
                  key={move}
                  type="button"
                  onClick={() => setPromptInput(move)}
                  className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-teal-500/15 hover:text-teal-600 text-[10px] font-medium transition"
                >
                  + {move}
                </button>
              ))}
            </div>

            {attachedFile && (
              <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-teal-500/10 text-[11px] font-mono text-teal-600">
                <span>📎 {attachedFile}</span>
                <button type="button" onClick={() => setAttachedFile(null)}>
                  ✕
                </button>
              </div>
            )}

            <textarea
              rows={3}
              data-testid="editor-turn-input"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask AI to add a sensor, change button behavior, or enable WiFi webhook..."
              className="w-full p-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs resize-none"
            />
            <div className="flex items-center gap-2">
              <label
                id="attachbtn"
                title="Attach file"
                className="cursor-pointer px-3 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                📎
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAttachedFile(f.name);
                  }}
                />
              </label>
              <button
                id="followup-mic"
                type="button"
                onClick={() => {
                  if (dictating) {
                    setDictating(false);
                    return;
                  }
                  setDictating(true);
                  setTimeout(() => {
                    setPromptInput('Add a sound chime on the Speaker whenever the Button is pressed.');
                    setDictating(false);
                  }, 1000);
                }}
                className={`px-3 py-2 rounded-full border text-xs ${
                  dictating
                    ? 'border-rose-500 bg-rose-500 text-white animate-pulse'
                    : 'border-zinc-200 dark:border-zinc-700'
                }`}
                title="Dictate follow-up"
              >
                🎤
              </button>
              <button
                type="submit"
                disabled={synthesizing}
                data-testid="editor-turn-submit"
                className="flex-1 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition"
              >
                {synthesizing
                  ? 'Synthesizing Turn...'
                  : `Synthesize ${phase.toUpperCase()} Update →`}
              </button>
            </div>
          </form>
        </div>

        {/* Right Pane: Active Phase Canvas */}
        <div className="lg:col-span-8 space-y-6">
          {phase === 'electronics' ? (
            <>
              <BoardViewer3D
                title={`${title} — 14-Port Motherboard Digital Twin`}
                placements={placements}
                interactive={true}
                heightClass="h-[440px]"
              />

              {/* Parameter Tune Panel (#tunepanel) & BOM / Power Rail Bar */}
              <div
                id="tunepanel"
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-zinc-500">LED BRIGHTNESS CAP</span>
                    <span className="font-bold text-teal-600">{ledBrightnessCap}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={ledBrightnessCap}
                    onChange={(e) => setLedBrightnessCap(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-zinc-500">LOOP POLLING RATE</span>
                    <span className="font-bold text-teal-600">{sampleRateHz} Hz</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    value={sampleRateHz}
                    onChange={(e) => setSampleRateHz(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
                <div className="flex items-center justify-between md:justify-end gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-mono text-[11px] font-bold">
                    3V3 {placements.length * 45}/800 mA OK
                  </span>
                  <Link
                    href="/cart"
                    className="px-3.5 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold"
                  >
                    Order BOM →
                  </Link>
                </div>
              </div>

              {/* Advanced Mode: Manual 14-Port Slot Inspector & Mutator */}
              {editorMode === 'advanced' && (
                <div
                  data-testid="advanced-slot-editor"
                  className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-teal-600">
                        ADVANCED HARDWARE TOPOLOGY
                      </div>
                      <h3 className="text-lg font-display font-bold">
                        14-Port Magnetic Slot Assignment
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <select
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                      >
                        {Array.from({ length: 14 }, (_, i) => `S${i + 1}`).map((s) => (
                          <option key={s} value={s}>
                            Slot {s}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newPartId}
                        onChange={(e) => setNewPartId(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                      >
                        {CATALOG_PARTS.slice(0, 25).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.id})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddPlacement}
                        className="px-4 py-1.5 rounded-full bg-teal-600 text-white font-semibold"
                      >
                        Assign Slot
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {placements.map((pl) => (
                      <div
                        key={`${pl.slot}-${pl.instance_id}`}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-mono font-bold text-teal-600">
                            {pl.slot}
                          </div>
                          <div className="font-medium truncate max-w-[110px]">
                            {pl.part_id}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePlacement(pl.slot)}
                          className="text-zinc-400 hover:text-rose-500 text-xs"
                          title="Remove from slot"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : phase === 'wifi' ? (
            /* 3. WIFI Stage Card (#vp-card-wifi) matching wificard.js */
            <div
              id="vp-card-wifi"
              data-testid="wifi-stage-card"
              className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-teal-600">
                    STAGE 3 · WIFI &amp; REMOTE GATEWAY
                  </div>
                  <h2 className="text-xl font-display font-bold mt-0.5">
                    Connect Your Board to Wi-Fi &amp; Send Live Actions
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-mono text-xs font-bold">
                  {wifiProvisioned ? `Connected: ${wifiSsid}` : 'ESP32-S3 2.4 GHz Ready'}
                </span>
              </div>

              {/* Connection Checks (#wc-checks) */}
              <div id="wc-checks" className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="font-mono text-[10px] text-emerald-600 font-bold">✓ CHECK 1</div>
                  <div className="font-semibold mt-0.5">Firmware Gateway Compiled</div>
                  <div className="text-[11px] text-zinc-500">JSON command parser active on 115200 baud &amp; WebSocket</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="font-mono text-[10px] text-emerald-600 font-bold">✓ CHECK 2</div>
                  <div className="font-semibold mt-0.5">2.4 GHz Wi-Fi Credentials</div>
                  <div className="text-[11px] text-zinc-500">Stored in ESP32-S3 NVS partition across reboots</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="font-mono text-[10px] text-emerald-600 font-bold">✓ CHECK 3</div>
                  <div className="font-semibold mt-0.5">Inbound / Outbound Webhooks</div>
                  <div className="text-[11px] text-zinc-500">REST + WebSocket bridge ready</div>
                </div>
              </div>

              {/* Wi-Fi SSID/Password Provisioning Form (#wc-wifi-form) */}
              <div
                id="wc-wifi-form"
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 space-y-3 text-xs"
              >
                <div className="font-semibold text-sm">1. Provision Board Wi-Fi Credentials (2.4 GHz)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="Wi-Fi Network Name (SSID)"
                    className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
                  />
                  <input
                    type="password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Wi-Fi Password"
                    className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setWifiProvisioned(true)}
                    className="px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold"
                  >
                    {wifiProvisioned ? '✓ Saved to Board NVS' : 'Save Wi-Fi to Board'}
                  </button>
                </div>
              </div>

              {/* Live Communication Sender (#fw-wifi) */}
              <form id="fw-wifi" onSubmit={handleWifiSend} className="space-y-3 text-xs">
                <div className="font-semibold text-sm">2. Live Communication — Send Action to Board</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={wifiEndpoint}
                    onChange={(e) => setWifiEndpoint(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                  <input
                    type="text"
                    value={wifiPayload}
                    onChange={(e) => setWifiPayload(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="wifi-send-btn"
                  className="px-5 py-2 rounded-full bg-teal-600 text-white font-semibold"
                >
                  Send Live Command →
                </button>
              </form>

              {wifiResponse && (
                <pre
                  data-testid="wifi-response-box"
                  className="p-4 rounded-2xl bg-zinc-950 text-teal-300 font-mono text-xs overflow-x-auto"
                >
                  {wifiResponse}
                </pre>
              )}

              {/* From Your Own Code (#wc-code) */}
              <div id="wc-code" className="space-y-2">
                <div className="font-semibold text-xs text-zinc-500 uppercase font-mono">
                  3. From your own code (curl / Python / JS)
                </div>
                <pre className="p-4 rounded-2xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto">
{`curl -X POST https://studio.atech.dev/api/projects/${projectId}/device/send \\
  -H "Content-Type: application/json" \\
  -d '${wifiPayload}'`}
                </pre>
              </div>
            </div>
          ) : (
            /* FIRMWARE Phase View */
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setFirmwareTab('code')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                      firmwareTab === 'code'
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                        : 'text-zinc-500'
                    }`}
                  >
                    ESP32-S3 C++ Files
                  </button>
                  <button
                    onClick={() => setFirmwareTab('flash')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                      firmwareTab === 'flash'
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                        : 'text-zinc-500'
                    }`}
                  >
                    Flash via USB (WebSerial)
                  </button>
                  <button
                    onClick={() => setFirmwareTab('midi')}
                    data-testid="firmware-midi-tab"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                      firmwareTab === 'midi'
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                        : 'text-zinc-500'
                    }`}
                  >
                    Phone Flash (USB-MIDI .syx)
                  </button>
                  <button
                    onClick={() => setFirmwareTab('wifi')}
                    data-testid="firmware-wifi-tab"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                      firmwareTab === 'wifi'
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                        : 'text-zinc-500'
                    }`}
                  >
                    WiFi Bridge & Webhooks
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                  >
                    Copy C++
                  </button>
                  <button
                    onClick={handleDownloadIno}
                    className="px-3.5 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold"
                  >
                    Download .ino
                  </button>
                </div>
              </div>

              {firmwareTab === 'code' && (
                <div>
                  {/* Multi-File Firmware Switcher */}
                  <div className="px-6 py-2.5 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    {(
                      [
                        'sketch.ino',
                        'transport.h',
                        'wifi_gateway.h',
                        'midi_flash.cpp',
                        'platformio.ini',
                        'README.md',
                      ] as const
                    ).map((fname) => (
                      <button
                        key={fname}
                        type="button"
                        onClick={() => setActiveFwFile(fname)}
                        className={`px-3 py-1 rounded-lg transition ${
                          activeFwFile === fname
                            ? 'bg-teal-500 text-zinc-950 font-bold'
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {fname}
                      </button>
                    ))}
                  </div>
                  <div className="p-6 bg-zinc-950">
                    <textarea
                      value={
                        activeFwFile === 'sketch.ino'
                          ? code
                          : activeFwFile === 'transport.h'
                          ? '// Atech 115200-baud JSON Serial + WebSocket Transport Header\n#pragma once\n#include <Arduino.h>\nvoid atechEmitEvent(const char* event, const char* jsonFields);'
                          : activeFwFile === 'wifi_gateway.h'
                          ? `// ESP32-S3 Wi-Fi Gateway & Webhook Bridge (${wifiSsid})\n#pragma once\n#include <WiFi.h>\n#include <WebServer.h>\nvoid setupWifiGateway(const char* ssid, const char* pass);`
                          : activeFwFile === 'midi_flash.cpp'
                          ? '// USB-MIDI SysEx OTA Receiver (0xF0 0x7D 0x41 0x54 ... 0xF7)\n// Allows flashing firmware from iOS/Android browsers over USB-MIDI without WebSerial.'
                          : activeFwFile === 'platformio.ini'
                          ? '[env:esp32-s3-devkitc-1]\nplatform = espressif32\nboard = esp32-s3-devkitc-1\nframework = arduino\nmonitor_speed = 115200'
                          : `# ${title}\n\nGenerated by Atech Studio (${version}).\nModules mapped: ${placements.map((p) => `${p.part_id} @ ${p.slot}`).join(', ')}`
                      }
                      onChange={(e) => {
                        if (activeFwFile === 'sketch.ino') setCode(e.target.value);
                      }}
                      rows={20}
                      spellCheck={false}
                      className="w-full bg-transparent text-teal-300 font-mono text-xs focus:outline-hidden leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {firmwareTab === 'midi' && (
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-bold text-lg">
                        USB-MIDI Phone &amp; Tablet Flasher (SysEx OTA)
                      </h3>
                      <p className="text-xs text-zinc-500">
                        On mobile browsers where WebSerial is unavailable, Atech wraps the ESP32-S3
                        firmware image into standard USB-MIDI SysEx packets (<code>0xF0 0x7D 0x41 0x54</code>).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const syxBytes = new Uint8Array([
                          0xf0, 0x7d, 0x41, 0x54, 0x01, 0x00, 0xf7,
                        ]);
                        const blob = new Blob([syxBytes], { type: 'application/octet-stream' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${version}.syx`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-5 py-2.5 rounded-full bg-teal-600 text-white text-xs font-semibold"
                    >
                      Download .syx Firmware Bundle
                    </button>
                  </div>
                </div>
              )}

              {firmwareTab === 'flash' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-lg">
                        Direct USB-C WebSerial Flasher
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Connect your Atech 14-Port ESP32-S3 motherboard over USB-C and
                        flash the synthesized binary directly from your browser.
                      </p>
                    </div>
                    <button
                      onClick={handleSimulateFlash}
                      disabled={flashing}
                      className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
                    >
                      {flashing ? 'Flashing ESP32-S3...' : 'Compile & Flash via USB'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-200 font-mono text-xs space-y-1 min-h-[180px]">
                    {flashLogs.length === 0 ? (
                      <div className="text-zinc-500">
                        Ready. Click &ldquo;Compile &amp; Flash via USB&rdquo; to build and upload firmware.
                      </div>
                    ) : (
                      flashLogs.map((l, i) => <div key={i}>{l}</div>)
                    )}
                  </div>
                </div>
              )}

              {firmwareTab === 'wifi' && (
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-lg">
                      WiFi Gateway & Live HTTP Webhook Bridge
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Test sending an inbound JSON command to your device&apos;s WiFi
                      Gateway endpoint.
                    </p>
                  </div>

                  <form onSubmit={handleWifiSend} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Device Endpoint</label>
                        <input
                          type="text"
                          value={wifiEndpoint}
                          onChange={(e) => setWifiEndpoint(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1">JSON Payload</label>
                        <input
                          type="text"
                          value={wifiPayload}
                          onChange={(e) => setWifiPayload(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      data-testid="wifi-send-btn"
                      className="px-5 py-2 rounded-full bg-teal-600 text-white font-semibold"
                    >
                      Send Test Payload to Device →
                    </button>
                  </form>

                  {wifiResponse && (
                    <pre
                      data-testid="wifi-response-box"
                      className="p-4 rounded-2xl bg-zinc-950 text-teal-300 font-mono text-xs overflow-x-auto"
                    >
                      {wifiResponse}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
