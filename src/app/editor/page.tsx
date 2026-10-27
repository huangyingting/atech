'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShellChrome } from '@/components/ShellChrome';
import { EDITOR_PROMPTS } from '@/data/store-data';
import { Board3DStage } from '@/components/Board3DStage';

export default function QuickEditorPage() {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [promptText, setPromptText] = useState(EDITOR_PROMPTS[0].prompt);
  const [listening, setListening] = useState(false);
  const [copiedPip, setCopiedPip] = useState(false);

  const activePreset = EDITOR_PROMPTS[selectedIdx] || EDITOR_PROMPTS[0];

  const toggleVoice = () => {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    setTimeout(() => {
      setPromptText(
        'Build a desktop CO2 and temperature monitor with a Color Display, CO2 sensor, and 3x3 LED Grid that turns amber above 1000 ppm.'
      );
      setListening(false);
    }, 1800);
  };

  return (
    <ShellChrome>
      <div data-testid="quick-editor-page" className="mx-auto max-w-6xl px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-semibold text-slate-700">
            <span>Making hardware easy</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Describe what you want, or just say it.
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Pick an idea below, speak into your microphone, or type your own hardware device. Atech
            Studio maps the ports, writes the ESP32-S3 firmware, and flashes it over USB-C.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {EDITOR_PROMPTS.map((item, idx) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setSelectedIdx(idx);
                setPromptText(item.prompt);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                selectedIdx === idx
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Make me a..."
            className="w-full resize-none border-0 bg-transparent text-lg text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="editor-mic-btn"
                onClick={toggleVoice}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  listening
                    ? 'animate-pulse bg-rose-600 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🎤 {listening ? 'Listening…' : 'Dictate with voice'}</span>
              </button>
              <div className="flex flex-wrap gap-1.5">
                {activePreset.modules.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(`/studio?prompt=${encodeURIComponent(promptText)}`)
              }
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <span>Build this →</span>
            </button>
          </div>
        </div>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-12">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 lg:col-span-7">
            <Board3DStage
              boardType="14port_board"
              placements={[
                { instance_id: 'led_1', part_id: 'neopixel_grid', slot: 'S1' },
                { instance_id: 'temp_1', part_id: 'dht11_temp_humidity', slot: 'S2' },
                { instance_id: 'screen_1', part_id: 'st7735_tft', slot: 'S3' },
                { instance_id: 'knob_1', part_id: 'rotary_encoder_knob', slot: 'S5' },
                { instance_id: 'btn_1', part_id: 'button_module', slot: 'S7' },
                { instance_id: 'spk_1', part_id: 'speaker', slot: 'S9' },
              ]}
              emulating={true}
            />
          </div>

          <div className="space-y-4 lg:col-span-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Or control your board directly from Python &amp; coding agents
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Install the Atech Python SDK to stream sensor events and send actuator actions over
              115200-baud USB-C Serial or Wi-Fi WebSockets.
            </p>
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-emerald-400">
              <span>$ pip install atech</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText('pip install atech');
                  setCopiedPip(true);
                  setTimeout(() => setCopiedPip(false), 1800);
                }}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
              >
                {copiedPip ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ShellChrome>
  );
}
