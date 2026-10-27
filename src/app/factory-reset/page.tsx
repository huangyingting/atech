'use client';

import React, { useState } from 'react';
import { ShellChrome } from '@/components/ShellChrome';

export default function FactoryResetPage() {
  const [screenName, setScreenName] = useState('');
  const [buttonPressedCount, setButtonPressedCount] = useState(0);
  const [flashState, setFlashState] = useState<'idle' | 'connecting' | 'flashing' | 'done'>('idle');
  const [progressPct, setProgressPct] = useState(0);
  const [statusLog, setStatusLog] = useState<string[]>([]);

  const greetingText = screenName.trim() ? `Hi ${screenName.trim()}!` : 'Hi there!';

  const handleResetBoard = async () => {
    setFlashState('connecting');
    setProgressPct(10);
    setStatusLog([
      'Requesting USB-C WebSerial port (115200 baud, ESP32-S3)...',
      `Baking custom greeting "${greetingText}" into NVS partition @ 0x9000...`,
    ]);

    setTimeout(() => {
      setFlashState('flashing');
      setProgressPct(55);
      setStatusLog((prev) => [
        ...prev,
        'Flashing Original setup 2026.10.21 (bootloader.bin @ 0x0, partitions.bin @ 0x8000, firmware.bin @ 0x10000)...',
      ]);
    }, 600);

    setTimeout(() => {
      setFlashState('done');
      setProgressPct(100);
      setStatusLog((prev) => [
        ...prev,
        `✓ Factory reset complete! Board rebooted with "${greetingText} Welcome to Atech."`,
      ]);
    }, 1500);
  };

  return (
    <ShellChrome>
      <div data-testid="factory-reset-page" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <span>Factory Reset</span>
              <span>·</span>
              <span className="font-mono">Original setup 2026.10.21</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Restore the out-of-the-box software
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              Plug your board in with USB-C and flash the original welcome demo. Add a name first
              if you want the screen to greet someone when it boots.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                <label htmlFor="screen-name-input">NAME ON THE SCREEN</label>
                <span>OPTIONAL</span>
              </div>
              <input
                id="screen-name-input"
                data-testid="factory-reset-name-input"
                type="text"
                maxLength={24}
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                placeholder="Leave blank for “Hi there!”"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="factory-reset-btn"
                onClick={handleResetBoard}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <span>⚡ Reset board</span>
              </button>

              <button
                type="button"
                onClick={() => setButtonPressedCount((c) => c + 1)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <span>Test Button Press ({buttonPressedCount})</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Chrome or Edge on desktop · Original setup 2026.10.21
            </p>

            {flashState !== 'idle' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-200">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-emerald-400">
                    {flashState === 'done' ? 'READY' : 'FLASHING OVER WEBSERIAL...'}
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  {statusLog.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="relative mx-auto max-w-xl rounded-[32px] border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-200/70 p-8 shadow-xl">
              <div className="mx-auto max-w-md rounded-3xl border-4 border-slate-800 bg-[#161920] p-6 text-white shadow-2xl">
                <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-slate-400">
                  <span>ATECH 14-PORT BOARD</span>
                  <span>ST7735 160×80 PREVIEW</span>
                </div>

                <div
                  data-testid="factory-reset-screen-preview"
                  className="rounded-2xl border-2 border-slate-700 bg-[#090b10] p-6 shadow-inner"
                >
                  <div className="font-mono text-2xl font-bold tracking-tight text-emerald-400">
                    {greetingText}
                  </div>
                  <div className="mt-2 font-mono text-base text-white">Welcome to Atech.</div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-amber-300">
                    <span>
                      {buttonPressedCount === 0
                        ? 'Press a button.'
                        : `Button pressed ${buttonPressedCount}×! RGB rainbow active ✨`}
                    </span>
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center font-mono text-xs">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] text-slate-400">PORT 1</div>
                    <div className="mt-1 font-semibold text-white">LED Grid</div>
                    <div className="mt-2 grid grid-cols-3 gap-1 px-4">
                      {Array.from({ length: 9 }).map((_, idx) => (
                        <span
                          key={idx}
                          className={`h-2.5 w-2.5 rounded-sm ${
                            buttonPressedCount > 0 ? 'bg-emerald-400' : 'bg-sky-400/70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] text-slate-400">PORT 5</div>
                    <div className="mt-1 font-semibold text-white">Knob</div>
                    <div className="mt-2 text-[11px] text-emerald-300">Detent Ready</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setButtonPressedCount((c) => c + 1)}
                    className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 transition hover:bg-emerald-500/20"
                  >
                    <div className="text-[10px] text-emerald-300">PORT 7</div>
                    <div className="mt-1 font-semibold text-white">Push Button</div>
                    <div className="mt-2 text-[11px] text-emerald-300">Click to Press</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShellChrome>
  );
}
