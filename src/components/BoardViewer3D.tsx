'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { PlacedModuleInstance } from '@/lib/studio-engine';

export type CameraPreset = 'ISO' | 'TOP' | 'FRONT' | 'RIGHT' | 'BACK' | 'LEFT';

interface BoardViewer3DProps {
  boardId?: string;
  modules?: PlacedModuleInstance[];
  placements?: Array<{
    instance_id: string;
    part_id: string;
    slot: string;
    rotation_deg?: number;
  }>;
  interactive?: boolean;
  heightClass?: string;
  title?: string;
  compact?: boolean;
  initialEmulate?: boolean;
  showcaseMode?: string;
  onEventEmitted?: (eventPayload: Record<string, unknown>) => void;
  onModulesChange?: (nextModules: PlacedModuleInstance[]) => void;
}

const PORT_COORDS: Record<
  string,
  { x: number; y: number; side: 'left' | 'middle' | 'right'; label: string }
> = {
  port_1: { x: 42, y: 55, side: 'left', label: '1' },
  port_2: { x: 42, y: 100, side: 'left', label: '2' },
  port_3: { x: 42, y: 145, side: 'left', label: '3' },
  port_4: { x: 42, y: 190, side: 'left', label: '4' },
  port_5: { x: 42, y: 235, side: 'left', label: '5' },
  port_6: { x: 42, y: 280, side: 'left', label: '6' },
  port_7: { x: 160, y: 48, side: 'middle', label: '7' },
  port_8: { x: 160, y: 292, side: 'middle', label: '8 USB-C' },
  port_9: { x: 278, y: 55, side: 'right', label: '9' },
  port_10: { x: 278, y: 100, side: 'right', label: '10' },
  port_11: { x: 278, y: 145, side: 'right', label: '11' },
  port_12: { x: 278, y: 190, side: 'right', label: '12 RST' },
  port_13: { x: 278, y: 235, side: 'right', label: '13' },
  port_14: { x: 278, y: 280, side: 'right', label: '14' },
};

const CAMERA_TRANSFORMS: Record<CameraPreset, string> = {
  ISO: 'perspective(900px) rotateX(28deg) rotateZ(-18deg) scale(0.96)',
  TOP: 'perspective(900px) rotateX(0deg) rotateZ(0deg) scale(1)',
  FRONT: 'perspective(900px) rotateX(52deg) rotateZ(0deg) scale(0.95)',
  RIGHT: 'perspective(900px) rotateX(32deg) rotateY(-28deg) rotateZ(-8deg) scale(0.95)',
  BACK: 'perspective(900px) rotateX(45deg) rotateZ(180deg) scale(0.92)',
  LEFT: 'perspective(900px) rotateX(32deg) rotateY(28deg) rotateZ(8deg) scale(0.95)',
};

export function BoardViewer3D({
  boardId = '14port_board',
  modules: propModules,
  placements,
  title = 'Atech 14-Port Build',
  compact = false,
  initialEmulate = false,
  showcaseMode = 'arcade',
  onEventEmitted,
}: BoardViewer3DProps) {
  const modules: PlacedModuleInstance[] = React.useMemo(() => {
    if (propModules && propModules.length > 0) return propModules;
    if (placements && placements.length > 0) {
      return placements.map((p, idx) => {
        const slotNum = p.slot?.replace(/^S/i, '').replace(/^port_/i, '') || String(idx + 1);
        const portName = `port_${slotNum}`;
        const slotInt = parseInt(slotNum, 10) || 1;
        return {
          instance: p.instance_id || `${p.part_id}_${idx + 1}`,
          module_id: p.part_id,
          name: p.part_id.replace(/_/g, ' '),
          ports: [portName],
          size: 1,
          interface: 'digital',
          side: slotInt <= 6 ? 'left' : slotInt <= 8 ? 'middle' : 'right',
          color: '#14b8a6',
        };
      });
    }
    return [
      {
        instance: 'screen_1',
        module_id: 'st7735_tft',
        name: 'Color Screen',
        ports: ['port_3', 'port_4'],
        size: 2,
        interface: 'spi',
        side: 'left',
        color: '#0ea5e9',
      },
      {
        instance: 'knob_1',
        module_id: 'rotary_encoder_knob',
        name: 'Rotary Knob',
        ports: ['port_5'],
        size: 1,
        interface: 'digital',
        side: 'left',
        color: '#f59e0b',
      },
      {
        instance: 'btn_1',
        module_id: 'button_module',
        name: 'Push Button',
        ports: ['port_1'],
        size: 1,
        interface: 'digital',
        side: 'left',
        color: '#10b981',
      },
      {
        instance: 'spk_1',
        module_id: 'speaker',
        name: 'Speaker',
        ports: ['port_9', 'port_10'],
        size: 2,
        interface: 'i2s',
        side: 'right',
        color: '#ec4899',
      },
    ];
  }, [propModules, placements]);
  const [camera, setCamera] = useState<CameraPreset>('ISO');
  const [spinning, setSpinning] = useState(false);
  const [showPortLabels, setShowPortLabels] = useState(true);
  const [emulating, setEmulating] = useState(initialEmulate);
  const [muted, setMuted] = useState(false);

  // Live emulated hardware state
  const [knobPos, setKnobPos] = useState(0);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [holdMs, setHoldMs] = useState(0);
  const [distanceMm, setDistanceMm] = useState(140);
  const [soilPct, setSoilPct] = useState(64);
  const [tempC, setTempC] = useState(22.4);
  const [micLevel, setMicLevel] = useState(35);
  const [deviceState, setDeviceState] = useState<'IDLE' | 'LISTENING' | 'PLAYING'>('IDLE');
  const [screenTitle, setScreenTitle] = useState(title);
  const [screenSubtitle, setScreenSubtitle] = useState('Hold button or turn knob');
  const [paddleX, setPaddleX] = useState(50);
  const [ballPos, setBallPos] = useState({ x: 50, y: 45, vx: 4, vy: 5 });
  const [gameScore, setGameScore] = useState(0);
  const [serialLog, setSerialLog] = useState<string[]>([
    `{"event":"boot_ready","board":"${boardId}","baud":115200}`,
  ]);

  const holdStartRef = useRef<number | null>(null);

  useEffect(() => {
    setScreenTitle(title);
  }, [title]);

  const playBeep = useCallback(
    (freq = 523, durationMs = 90) => {
      if (muted || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close().catch(() => null);
        }, durationMs);
      } catch {
        // WebAudio blocked or unsupported
      }
    },
    [muted]
  );

  const pushEvent = useCallback(
    (payload: Record<string, unknown>) => {
      const line = JSON.stringify(payload);
      setSerialLog((prev) => [...prev.slice(-14), line]);
      onEventEmitted?.(payload);
    },
    [onEventEmitted]
  );

  // Arcade & emulation tick loop when emulating
  useEffect(() => {
    if (!emulating) return;
    const timer = setInterval(() => {
      setBallPos((prev) => {
        let nx = prev.x + prev.vx;
        let ny = prev.y + prev.vy;
        let vx = prev.vx;
        let vy = prev.vy;
        if (nx <= 8 || nx >= 92) vx = -vx;
        if (ny <= 12) vy = Math.abs(vy);
        if (ny >= 84) {
          if (Math.abs(nx - paddleX) <= 22) {
            vy = -Math.abs(vy);
            setGameScore((s) => s + 10);
          } else {
            ny = 30;
          }
        }
        return { x: nx, y: ny, vx, vy };
      });
    }, 120);
    return () => clearInterval(timer);
  }, [emulating, paddleX]);

  const handleKnobStep = (delta: number) => {
    const next = knobPos + delta;
    setKnobPos(next);
    setPaddleX((p) => Math.max(15, Math.min(85, p + delta * 10)));
    setScreenSubtitle(`Knob: ${next} (${delta > 0 ? '+1 CW' : '-1 CCW'})`);
    playBeep(delta > 0 ? 660 : 440, 60);
    pushEvent({ event: 'knob_turned', port: 5, delta, position: next });
  };

  const handleButtonDown = () => {
    setButtonPressed(true);
    holdStartRef.current = Date.now();
    setDeviceState('LISTENING');
    setScreenSubtitle('Listening... release to send');
    playBeep(587, 80);
    pushEvent({ event: 'button_pressed', port: 7 });
  };

  const handleButtonUp = () => {
    if (!buttonPressed) return;
    setButtonPressed(false);
    const elapsed = holdStartRef.current ? Date.now() - holdStartRef.current : 250;
    setHoldMs(elapsed);
    setDeviceState('PLAYING');
    setScreenSubtitle(`Sent (${elapsed} ms) · Playing melody`);
    playBeep(784, 140);
    pushEvent({ event: 'button_released', port: 7, hold_ms: elapsed });
    setTimeout(() => {
      setDeviceState('IDLE');
    }, 2400);
  };

  const volumePercent = Math.round(
    Math.max(10, Math.min(100, ((300 - Math.min(300, Math.max(50, distanceMm))) / 250) * 90 + 10))
  );

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/90 text-xs">
          <div className="flex items-center gap-1" role="group" aria-label="3D Camera Presets">
            {(['TOP', 'FRONT', 'RIGHT', 'BACK', 'LEFT', 'ISO'] as CameraPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSpinning(false);
                  setCamera(preset);
                }}
                className={`px-2.5 py-1 rounded-md font-mono font-medium transition ${
                  camera === preset && !spinning
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPortLabels((v) => !v)}
              className={`px-2.5 py-1 rounded-md font-medium border transition ${
                showPortLabels
                  ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'border-transparent text-zinc-500'
              }`}
            >
              Ports
            </button>
            <button
              type="button"
              onClick={() => setSpinning((v) => !v)}
              className={`px-2.5 py-1 rounded-md font-medium border transition ${
                spinning
                  ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                  : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Spin
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
            >
              {muted ? 'Muted' : 'Sound On'}
            </button>
            <button
              type="button"
              onClick={() => setEmulating((e) => !e)}
              data-testid="toggle-emulate-btn"
              className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
                emulating
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  emulating ? 'bg-white animate-pulse' : 'bg-emerald-400'
                }`}
              />
              {emulating ? 'Emulating in 3D' : 'Emulate'}
            </button>
          </div>
        </div>
      )}

      {/* 3D Grid Stage & Board Visualization */}
      <div
        className={`relative flex items-center justify-center overflow-hidden ${
          compact ? 'h-52' : 'min-h-[370px] py-6'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.08), transparent 70%), linear-gradient(to right, rgba(161, 161, 170, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(161, 161, 170, 0.14) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 24px 24px, 24px 24px',
        }}
      >
        <div
          className={`transition-transform duration-500 ease-out ${
            spinning ? 'animate-[spin_18s_linear_infinite]' : ''
          }`}
          style={{
            transform: compact
              ? 'perspective(700px) rotateX(26deg) rotateZ(-16deg) scale(0.68)'
              : CAMERA_TRANSFORMS[camera],
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Physical 14-Port / 10-Port Motherboard PCB */}
          <div className="relative w-[320px] h-[340px] rounded-2xl bg-zinc-900 border-2 border-zinc-700 shadow-[0_24px_48px_rgba(0,0,0,0.35)] p-3 select-none">
            {/* Inner silkscreen & ESP32-S3 MCU */}
            <div className="absolute inset-2 rounded-xl border border-zinc-800 pointer-events-none" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-28 rounded-lg bg-zinc-950 border border-zinc-700 flex flex-col items-center justify-center text-center p-2 shadow-inner">
              <div className="text-[9px] font-mono tracking-widest text-teal-400 uppercase">
                ATECH CPH
              </div>
              <div className="text-[11px] font-mono font-bold text-zinc-200 mt-0.5">
                ESP32-S3
              </div>
              <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                {boardId === '14port_board' ? '14-PORT REV4' : '10-PORT MINI'}
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    emulating ? 'bg-emerald-400 animate-ping' : 'bg-teal-500'
                  }`}
                />
                <span className="text-[8px] font-mono text-zinc-400">
                  {emulating ? deviceState : 'PWR OK'}
                </span>
              </div>
            </div>

            {/* Numbered Port Slots */}
            {Object.entries(PORT_COORDS).map(([portKey, coord]) => {
              const isReserved = portKey === 'port_8' || portKey === 'port_12';
              return (
                <div
                  key={portKey}
                  style={{ left: coord.x - 32, top: coord.y - 16 }}
                  className={`absolute w-16 h-8 rounded border flex items-center justify-center text-[9px] font-mono ${
                    isReserved
                      ? 'border-amber-500/40 bg-zinc-950 text-amber-300/80'
                      : 'border-zinc-700/80 bg-zinc-800/60 text-zinc-400'
                  }`}
                >
                  {showPortLabels && <span>{coord.label}</span>}
                </div>
              );
            })}

            {/* Mounted Snap-in Modules */}
            {modules.map((mod) => {
              const firstPort = mod.ports[0] || 'port_1';
              const coord = PORT_COORDS[firstPort] || PORT_COORDS.port_1;
              const isDouble = mod.size === 2 || mod.ports.length === 2;
              const isScreen = mod.module_id.includes('tft') || mod.module_id.includes('screen');
              const isGrid = mod.module_id.includes('grid');
              const isKnob = mod.module_id.includes('knob');
              const isButton = mod.module_id.includes('button');
              const isSpeaker = mod.module_id.includes('speaker');

              return (
                <div
                  key={`${mod.instance}-${firstPort}`}
                  style={{
                    left: coord.x - 38,
                    top: coord.y - 18,
                    height: isDouble ? 82 : 38,
                    width: 78,
                    borderColor: mod.color || '#10B981',
                  }}
                  className="absolute z-10 rounded-lg bg-zinc-950/95 border-2 shadow-lg flex flex-col justify-between p-1.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-semibold text-white truncate">
                      {mod.name}
                    </span>
                    <span className="text-[8px] font-mono px-1 rounded bg-zinc-800 text-zinc-300">
                      {mod.ports.map((p) => p.replace('port_', 'P')).join('+')}
                    </span>
                  </div>

                  {/* Special visual renderers inside the 3D module cap */}
                  {isScreen && (
                    <div className="flex-1 mt-1 rounded bg-slate-950 border border-sky-500/40 p-1 flex flex-col justify-between overflow-hidden">
                      <div className="text-[8px] font-mono text-sky-400 truncate">
                        {screenTitle.slice(0, 16)}
                      </div>
                      {emulating && showcaseMode === 'arcade' ? (
                        <div className="relative h-7 w-full bg-slate-900 rounded overflow-hidden">
                          <div
                            style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
                            className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 -translate-x-1/2 -translate-y-1/2"
                          />
                          <div
                            style={{ left: `${paddleX}%` }}
                            className="absolute bottom-0.5 w-5 h-1 rounded bg-emerald-400 -translate-x-1/2"
                          />
                        </div>
                      ) : (
                        <div className="text-[7px] font-mono text-emerald-300 leading-tight truncate">
                          {emulating ? `${deviceState} · Vol ${volumePercent}%` : screenSubtitle}
                        </div>
                      )}
                      <div className="h-1 w-full bg-zinc-800 rounded overflow-hidden">
                        <div
                          style={{ width: `${volumePercent}%` }}
                          className="h-full bg-teal-400 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {isGrid && (
                    <div className="grid grid-cols-3 gap-0.5 w-7 h-5 mx-auto">
                      {Array.from({ length: 9 }).map((_, idx) => {
                        const lit =
                          !emulating ||
                          deviceState === 'PLAYING' ||
                          (deviceState === 'LISTENING' && idx < Math.ceil((micLevel / 100) * 9)) ||
                          idx % 2 === 0;
                        const pixelColor =
                          deviceState === 'LISTENING'
                            ? '#22C55E'
                            : deviceState === 'PLAYING'
                            ? '#A855F7'
                            : '#38BDF8';
                        return (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: lit ? pixelColor : '#27272A',
                              boxShadow: lit ? `0 0 6px ${pixelColor}` : 'none',
                            }}
                            className="rounded-[2px] block w-full h-full transition-colors"
                          />
                        );
                      })}
                    </div>
                  )}

                  {isKnob && (
                    <div className="flex items-center justify-center">
                      <div
                        style={{ transform: `rotate(${knobPos * 24}deg)` }}
                        className="w-4 h-4 rounded-full bg-amber-500/30 border border-amber-400 flex items-start justify-center transition-transform"
                      >
                        <span className="w-0.5 h-1.5 bg-amber-300 block" />
                      </div>
                    </div>
                  )}

                  {isButton && (
                    <div className="flex items-center justify-center">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border ${
                          buttonPressed
                            ? 'bg-rose-500 border-rose-300 scale-90'
                            : 'bg-zinc-800 border-rose-400/60'
                        } transition`}
                      />
                    </div>
                  )}

                  {isSpeaker && (
                    <div className="flex items-center justify-center gap-0.5 my-auto">
                      {[1, 2, 3, 4].map((bar) => (
                        <span
                          key={bar}
                          className={`w-1 rounded-full bg-violet-400 ${
                            emulating && deviceState === 'PLAYING' ? 'h-4 animate-pulse' : 'h-2'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Badge */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-white/85 dark:bg-zinc-900/85 backdrop-blur px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
          <span>{boardId.toUpperCase()}</span>
          <span>·</span>
          <span>{modules.length} modules placed</span>
          {emulating && (
            <>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                LIVE EMULATION ({gameScore > 0 ? `Score ${gameScore}` : deviceState})
              </span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Emulation Controls Drawer when Emulate is active */}
      {!compact && emulating && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Interactive Hardware Controls
              </span>
              <span className="text-xs text-zinc-500">
                Click button, turn rotary encoder, or slide sensors to stream 115200-baud JSON events
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onMouseDown={handleButtonDown}
                onMouseUp={handleButtonUp}
                onClick={() => {
                  if (!buttonPressed) {
                    handleButtonDown();
                    setTimeout(handleButtonUp, 320);
                  }
                }}
                data-testid="emulator-push-button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  buttonPressed
                    ? 'bg-rose-600 text-white scale-95'
                    : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90'
                }`}
              >
                {buttonPressed ? 'Holding Button...' : `Push Button (Last: ${holdMs}ms)`}
              </button>
              <button
                type="button"
                onClick={() => handleKnobStep(-1)}
                data-testid="emulator-knob-ccw"
                className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ↺ Knob -1
              </button>
              <span className="text-xs font-mono px-2 py-1 rounded bg-zinc-200/70 dark:bg-zinc-800">
                Pos: {knobPos}
              </span>
              <button
                type="button"
                onClick={() => handleKnobStep(1)}
                data-testid="emulator-knob-cw"
                className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Knob +1 ↻
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <label className="flex flex-col gap-1 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between font-mono">
                <span>Distance (mm)</span>
                <span className="text-teal-600 dark:text-teal-400">{distanceMm} mm</span>
              </div>
              <input
                type="range"
                min={30}
                max={400}
                value={distanceMm}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDistanceMm(val);
                  pushEvent({ event: 'distance_mm', port: 6, value: val });
                }}
              />
            </label>

            <label className="flex flex-col gap-1 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between font-mono">
                <span>Mic Voice Level</span>
                <span className="text-pink-600 dark:text-pink-400">{micLevel}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={micLevel}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMicLevel(val);
                  pushEvent({ event: 'sound_level', port: 10, level: val });
                }}
              />
            </label>

            <label className="flex flex-col gap-1 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between font-mono">
                <span>Soil Moisture</span>
                <span className="text-lime-600 dark:text-lime-400">{soilPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={soilPct}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSoilPct(val);
                  pushEvent({ event: 'soil_moisture', port: 2, percent: val });
                }}
              />
            </label>

            <label className="flex flex-col gap-1 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between font-mono">
                <span>Ambient Temp</span>
                <span className="text-amber-600 dark:text-amber-400">{tempC.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min={-10}
                max={55}
                step={0.5}
                value={tempC}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTempC(val);
                  pushEvent({ event: 'temp_humidity', port: 5, temp_c: val });
                }}
              />
            </label>
          </div>

          {/* Serial JSON Wire Output */}
          <div className="rounded-lg bg-zinc-950 text-zinc-200 p-2.5 font-mono text-[11px] max-h-24 overflow-y-auto border border-zinc-800">
            {serialLog.map((line, idx) => (
              <div key={idx} className="truncate text-emerald-400/90">
                <span className="text-zinc-500 mr-2">&gt;</span>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
