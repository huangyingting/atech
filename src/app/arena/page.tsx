'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShellChrome } from '@/components/ShellChrome';
import { ARENA_SCENARIOS } from '@/data/store-data';
import { Board3DStage } from '@/components/Board3DStage';

const WORLDS = [
  { id: 1, name: 'Studio Grid', tempC: 23.0, rh: 45, surface: 'Anodized Mat' },
  { id: 2, name: 'Obstacle Course', tempC: 24.5, rh: 48, surface: 'Plywood Ramp' },
  { id: 3, name: 'Ice Rink', tempC: -4.2, rh: 78, surface: 'Low-Friction Ice' },
  { id: 4, name: 'Mars Regolith', tempC: -18.0, rh: 12, surface: 'High-Grip Dust' },
];

const WEATHER_PRESETS = [
  { id: 1, name: '1 · Lab Nominal', tempC: 22.8, rh: 45, label: 'Comfortable' },
  { id: 2, name: '2 · Finnish Sauna', tempC: 78.4, rh: 68, label: 'Extreme Heat & Steam' },
  { id: 3, name: '3 · Sahara Noon', tempC: 46.2, rh: 11, label: 'Arid Heat' },
  { id: 4, name: '4 · Nordic Freezer', tempC: -14.5, rh: 64, label: 'Sub-Zero Frost' },
  { id: 5, name: '5 · Rainforest Canopy', tempC: 31.0, rh: 94, label: 'Tropical Condensing' },
  { id: 6, name: '6 · Server Rack Alert', tempC: 39.5, rh: 28, label: 'Thermal Throttle Warning' },
];

export default function ArenaPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<'car' | 'tumbler' | 'weather'>('car');
  const scenario = ARENA_SCENARIOS.find((s) => s.id === activeId) || ARENA_SCENARIOS[0];

  const [carPos, setCarPos] = useState({ x: 50, y: 55, heading: 0, speed: 0 });
  const [leftMotor, setLeftMotor] = useState(0);
  const [rightMotor, setRightMotor] = useState(0);
  const [autonomous, setAutonomous] = useState(false);
  const [worldIdx, setWorldIdx] = useState(0);
  const [activeTool, setActiveTool] = useState<'Q' | 'G' | 'V' | 'B' | 'X'>('Q');
  const [distanceMm, setDistanceMm] = useState(420);

  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [accel, setAccel] = useState({ x: 0.0, y: 0.0, z: 9.8 });
  const [gyro, setGyro] = useState({ p: 0, r: 0, y: 0 });
  const [records, setRecords] = useState({ airTimeMs: 640, peakG: 3.4, maxSpinDps: 720 });
  const [stuntStatus, setStuntStatus] = useState('Resting on desk (1.0 G)');

  const [weatherPreset, setWeatherPreset] = useState(WEATHER_PRESETS[0]);
  const [tempC, setTempC] = useState(23.0);
  const [humidityPct, setHumidityPct] = useState(45.0);
  const [weatherEffect, setWeatherEffect] = useState<string | null>(null);

  const world = WORLDS[worldIdx] || WORLDS[0];

  useEffect(() => {
    if (!autonomous || activeId !== 'car') return;
    const timer = setInterval(() => {
      setCarPos((prev) => {
        const nextHeading = (prev.heading + 14) % 360;
        const rad = (nextHeading * Math.PI) / 180;
        const nx = Math.max(15, Math.min(85, prev.x + Math.cos(rad) * 4));
        const ny = Math.max(18, Math.min(82, prev.y + Math.sin(rad) * 4));
        return { x: nx, y: ny, heading: nextHeading, speed: 68 };
      });
      setLeftMotor(75);
      setRightMotor(62);
      setDistanceMm(Math.round(180 + Math.random() * 450));
      setYaw((y) => (y + 14) % 360);
    }, 280);
    return () => clearInterval(timer);
  }, [autonomous, activeId]);

  const driveCar = (l: number, r: number, dHeading: number, dForward: number) => {
    setLeftMotor(l);
    setRightMotor(r);
    setCarPos((prev) => {
      const nextHeading = (prev.heading + dHeading + 360) % 360;
      const rad = (nextHeading * Math.PI) / 180;
      const nx = Math.max(12, Math.min(88, prev.x + Math.cos(rad) * dForward));
      const ny = Math.max(15, Math.min(85, prev.y + Math.sin(rad) * dForward));
      return { x: nx, y: ny, heading: nextHeading, speed: Math.round((Math.abs(l) + Math.abs(r)) / 2) };
    });
    setYaw((y) => (y + dHeading + 360) % 360);
    setDistanceMm(Math.max(60, Math.min(1200, Math.round(distanceMm - dForward * 12))));
  };

  const triggerStunt = (kind: 'toss' | 'drop' | 'spin' | 'flip' | 'shake') => {
    if (kind === 'toss') {
      setPitch(38);
      setRoll(-24);
      setYaw((y) => (y + 140) % 360);
      setAccel({ x: 2.4, y: -1.8, z: 28.6 });
      setGyro({ p: 320, r: -180, y: 410 });
      setStuntStatus('Airborne toss · 0.04 G free-fall → 2.9 G catch');
      setRecords((prev) => ({ ...prev, airTimeMs: Math.max(prev.airTimeMs, 890), peakG: Math.max(prev.peakG, 3.8) }));
    } else if (kind === 'drop') {
      setPitch(-12);
      setRoll(8);
      setAccel({ x: 0.9, y: 1.4, z: 54.2 });
      setGyro({ p: 90, r: 65, y: 40 });
      setStuntStatus('1m Drop impact detected · 5.5 G peak shock!');
      setRecords((prev) => ({ ...prev, airTimeMs: Math.max(prev.airTimeMs, 452), peakG: Math.max(prev.peakG, 5.5) }));
    } else if (kind === 'spin') {
      setYaw((y) => (y + 270) % 360);
      setGyro({ p: 12, r: 8, y: 980 });
      setAccel({ x: 14.2, y: 14.2, z: 9.8 });
      setStuntStatus('High-RPM flat spin · 980 °/s yaw velocity');
      setRecords((prev) => ({ ...prev, maxSpinDps: Math.max(prev.maxSpinDps, 980) }));
    } else if (kind === 'flip') {
      setPitch((p) => (p === 180 ? 0 : 180));
      setGyro({ p: 640, r: 0, y: 0 });
      setStuntStatus('360° Barrel Flip completed');
    } else {
      setAccel({ x: 18.4, y: -16.2, z: 22.1 });
      setGyro({ p: 420, r: -390, y: 280 });
      setStuntStatus('Rapid shake gesture triggered (`shake_detected`)');
    }
  };

  const applyWeather = (preset: typeof WEATHER_PRESETS[0]) => {
    setWeatherPreset(preset);
    setTempC(preset.tempC);
    setHumidityPct(preset.rh);
    setWeatherEffect(preset.label);
  };

  const dewPoint = Math.round((tempC - (100 - humidityPct) / 5) * 10) / 10;

  const placementsForScenario =
    activeId === 'car'
      ? [
          { instance_id: 'm_left', part_id: 'dc_motor', slot: 'S1' },
          { instance_id: 'temp_1', part_id: 'dht11_temp_humidity', slot: 'S2' },
          { instance_id: 'screen_1', part_id: 'st7735_tft', slot: 'S3' },
          { instance_id: 'imu_1', part_id: 'imu_6axis', slot: 'S5' },
          { instance_id: 'dist_1', part_id: 'ultrasonic_distance', slot: 'S7' },
          { instance_id: 'm_right', part_id: 'dc_motor', slot: 'S9' },
        ]
      : activeId === 'tumbler'
      ? [
          { instance_id: 'led_1', part_id: 'neopixel_grid', slot: 'S1' },
          { instance_id: 'screen_1', part_id: 'st7735_tft', slot: 'S3' },
          { instance_id: 'imu_1', part_id: 'imu_6axis', slot: 'S5' },
        ]
      : [
          { instance_id: 'led_1', part_id: 'neopixel_grid', slot: 'S1' },
          { instance_id: 'temp_1', part_id: 'dht11_temp_humidity', slot: 'S2' },
          { instance_id: 'screen_1', part_id: 'st7735_tft', slot: 'S3' },
        ];

  return (
    <ShellChrome>
      <div data-testid="arena-page" className="min-h-screen bg-[#0c0e12] text-white">
        <div className="border-b border-white/10 bg-[#11141b]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-2">
              {ARENA_SCENARIOS.map((item) => {
                const active = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`arena-tab-${item.id}`}
                    onClick={() => setActiveId(item.id)}
                    className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="font-mono text-xs opacity-60">{item.num}</span>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(`/studio?prompt=${encodeURIComponent(scenario.prompt)}`)
                }
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
              >
                <span>⚡ Flash to your board</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#171b24] to-[#0f1218] p-6 shadow-2xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
                    ARENA SANDBOX · {scenario.num} {scenario.name.toUpperCase()}
                  </span>
                  <h1 className="mt-1 text-2xl font-bold text-white">{scenario.title}</h1>
                  <p className="text-sm text-slate-400">{scenario.subtitle}</p>
                </div>

                {activeId === 'car' && (
                  <div className="flex items-center gap-2">
                    {WORLDS.map((w, idx) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setWorldIdx(idx);
                          setTempC(w.tempC);
                          setHumidityPct(w.rh);
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          worldIdx === idx
                            ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {w.id} · {w.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                  <Board3DStage
                    boardType="14port_board"
                    placements={placementsForScenario}
                    emulating={true}
                  />
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0b0d12] p-5">
                  {activeId === 'car' && (
                    <>
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>WORLD: {world.name.toUpperCase()}</span>
                          <span className="font-mono text-emerald-400">
                            ToF RANGE: {distanceMm} mm
                          </span>
                        </div>
                        <div className="relative mt-3 h-48 w-full overflow-hidden rounded-xl border border-white/10 bg-[#121620]">
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                              backgroundSize: '20px 20px',
                            }}
                          />
                          <div
                            className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-emerald-400 bg-emerald-500/20 font-mono text-xs font-bold text-emerald-300 shadow-lg transition-all duration-200"
                            style={{
                              left: `${carPos.x}%`,
                              top: `${carPos.y}%`,
                              transform: `translate(-50%, -50%) rotate(${carPos.heading}deg)`,
                            }}
                          >
                            ▲
                          </div>
                          <div className="absolute bottom-2 left-3 font-mono text-[11px] text-slate-400">
                            X:{Math.round(carPos.x)} Y:{Math.round(carPos.y)} · HDG:{carPos.heading}° · SPD:{carPos.speed}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => driveCar(50, 85, -25, 4)}
                            className="rounded-lg bg-white/10 py-2 text-xs font-semibold hover:bg-white/15"
                          >
                            ↖ Q / A Left
                          </button>
                          <button
                            type="button"
                            onClick={() => driveCar(85, 85, 0, 7)}
                            className="rounded-lg bg-emerald-500/20 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30"
                          >
                            ▲ W Drive
                          </button>
                          <button
                            type="button"
                            onClick={() => driveCar(85, 50, 25, 4)}
                            className="rounded-lg bg-white/10 py-2 text-xs font-semibold hover:bg-white/15"
                          >
                            ↗ E / D Right
                          </button>
                          <button
                            type="button"
                            onClick={() => driveCar(100, 100, 0, 12)}
                            className="rounded-lg bg-amber-500/20 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
                          >
                            ⚡ Shift Boost
                          </button>
                          <button
                            type="button"
                            onClick={() => driveCar(-65, -65, 0, -5)}
                            className="rounded-lg bg-white/10 py-2 text-xs font-semibold hover:bg-white/15"
                          >
                            ▼ S Reverse
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAutonomous(false);
                              driveCar(0, 0, 0, 0);
                            }}
                            className="rounded-lg bg-rose-500/20 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
                          >
                            ■ Space Brake
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setAutonomous((a) => !a)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                              autonomous
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-white/10 text-slate-300 hover:bg-white/15'
                            }`}
                          >
                            P · Autonomous Mode: {autonomous ? 'ON' : 'OFF'}
                          </button>
                          <div className="flex items-center gap-1">
                            {(['Q', 'G', 'V', 'B', 'X'] as const).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setActiveTool(t)}
                                className={`h-7 w-7 rounded-md font-mono text-xs font-bold ${
                                  activeTool === t
                                    ? 'bg-white text-slate-950'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeId === 'tumbler' && (
                    <div className="flex h-full flex-col justify-between space-y-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                          6-DOF PHYSICS TUMBLER RIG
                        </div>
                        <p className="mt-1 text-xs text-slate-300">{stuntStatus}</p>
                        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center font-mono">
                          <div>
                            <div className="text-[10px] text-slate-400">PITCH</div>
                            <div className="text-lg font-bold text-white">{pitch}°</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">ROLL</div>
                            <div className="text-lg font-bold text-white">{roll}°</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">YAW</div>
                            <div className="text-lg font-bold text-white">{yaw}°</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <button
                          type="button"
                          data-testid="tumbler-toss-btn"
                          onClick={() => triggerStunt('toss')}
                          className="rounded-xl bg-emerald-500/20 px-3 py-2.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30"
                        >
                          Space · Toss
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerStunt('drop')}
                          className="rounded-xl bg-amber-500/20 px-3 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
                        >
                          D · Drop from 1m
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerStunt('spin')}
                          className="rounded-xl bg-sky-500/20 px-3 py-2.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/30"
                        >
                          S · High Spin
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerStunt('flip')}
                          className="rounded-xl bg-purple-500/20 px-3 py-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/30"
                        >
                          F · Barrel Flip
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerStunt('shake')}
                          className="rounded-xl bg-rose-500/20 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
                        >
                          K · Shake Board
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPitch(0);
                            setRoll(0);
                            setYaw(0);
                            setAccel({ x: 0, y: 0, z: 9.8 });
                            setGyro({ p: 0, r: 0, y: 0 });
                            setStuntStatus('Resting on desk (1.0 G)');
                          }}
                          className="rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/15"
                        >
                          R · Reset Pose
                        </button>
                      </div>
                    </div>
                  )}

                  {activeId === 'weather' && (
                    <div className="flex h-full flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                            CLIMATE CHAMBER · {weatherPreset.name}
                          </span>
                          {weatherEffect && (
                            <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] text-sky-300">
                              {weatherEffect}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {WEATHER_PRESETS.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => applyWeather(p)}
                              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                                weatherPreset.id === p.id
                                  ? 'border-sky-400 bg-sky-500/20 text-white'
                                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              <div className="font-semibold">{p.name}</div>
                              <div className="font-mono text-[11px] text-slate-400">
                                {p.tempC}°C · {p.rh}% RH
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setHumidityPct((h) => Math.min(99, Math.round((h + 18) * 10) / 10));
                            setTempC((t) => Math.round((t - 1.2) * 10) / 10);
                            setWeatherEffect('Mist sprayed (+18% RH)');
                          }}
                          className="rounded-xl bg-sky-500/20 py-2.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/30"
                        >
                          💦 Space · Spray Water
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHumidityPct((h) => Math.min(99, Math.round((h + 12) * 10) / 10));
                            setTempC((t) => Math.round((t + 2.4) * 10) / 10);
                            setWeatherEffect('Warm breath (+2.4°C, +12% RH)');
                          }}
                          className="rounded-xl bg-emerald-500/20 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
                        >
                          🌬️ B · Breathe On It
                        </button>
                        <button
                          type="button"
                          data-testid="weather-hairdryer-btn"
                          onClick={() => {
                            setTempC((t) => Math.min(85, Math.round((t + 9.5) * 10) / 10));
                            setHumidityPct((h) => Math.max(8, Math.round((h - 14) * 10) / 10));
                            setWeatherEffect('Hair dryer heat blast (+9.5°C)');
                          }}
                          className="rounded-xl bg-amber-500/20 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
                        >
                          🔥 H · Hair Dryer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                {scenario.controls.map((c) => (
                  <div key={c.key} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <kbd className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                      {c.key}
                    </kbd>
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-white/10 bg-[#141821] p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ORIENTATION SENSOR · PORT 5
              </div>
              <div className="mt-3 space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pitch</span>
                  <span className="text-white">{pitch}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Roll</span>
                  <span className="text-white">{roll}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Yaw</span>
                  <span className="text-white">{yaw}°</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#141821] p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                TEMP &amp; HUMIDITY · PORT 2
              </div>
              <div className="mt-3 space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Temp</span>
                  <span className="text-emerald-400">{tempC.toFixed(1)} °C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Humidity</span>
                  <span className="text-sky-400">{humidityPct.toFixed(0)} %</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dew point</span>
                  <span className="text-slate-200">{dewPoint.toFixed(1)} °C</span>
                </div>
              </div>
            </div>

            {activeId === 'car' ? (
              <div className="rounded-2xl border border-white/10 bg-[#141821] p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  MOTORS
                </div>
                <div className="mt-3 space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Left (1, 6)</span>
                    <span className="text-emerald-400">{leftMotor}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Right (9, 14)</span>
                    <span className="text-emerald-400">{rightMotor}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-white/10 bg-[#141821] p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ACCELEROMETER &amp; GYROSCOPE
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs">
                    <div>
                      <div className="text-slate-400">X: {accel.x.toFixed(1)} m/s²</div>
                      <div className="text-slate-400">Y: {accel.y.toFixed(1)} m/s²</div>
                      <div className="text-white">Z: {accel.z.toFixed(1)} m/s²</div>
                    </div>
                    <div>
                      <div className="text-slate-400">P: {gyro.p} °/s</div>
                      <div className="text-slate-400">R: {gyro.r} °/s</div>
                      <div className="text-white">Y: {gyro.y} °/s</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#141821] p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    SESSION RECORDS
                  </div>
                  <div className="mt-3 space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best air time</span>
                      <span className="text-white">{records.airTimeMs} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hardest hit</span>
                      <span className="text-white">{records.peakG.toFixed(1)} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fastest spin</span>
                      <span className="text-white">{records.maxSpinDps} °/s</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-2xl border border-white/10 bg-[#141821] p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                MODULES IN THIS SCENARIO
              </div>
              <ul className="mt-3 space-y-2.5 text-xs">
                {scenario.modulesTested.map((m) => (
                  <li key={m.name} className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-white">{m.name}</div>
                      <div className="text-slate-400">{m.role}</div>
                    </div>
                    <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
                      {m.port}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ShellChrome>
  );
}
