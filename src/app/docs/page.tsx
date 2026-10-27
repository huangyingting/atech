'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ENRICHED_STORE_MODULES as STORE_MODULES } from '@/data/store-data';

const DOC_SECTIONS = [
  {
    id: 'quickstart',
    title: '1. Quickstart Guide',
    content: `1. Unbox your Atech Motherboard (ESP32-S3, 240MHz dual-core, 8MB PSRAM, 16MB Flash).
2. Snap modules onto any of the 14 magnetic pogo-pin ports (S1–S14). Orientation is reversible and current-protected.
3. Connect via USB-C or switch on the integrated LiPo battery.
4. Open Studio (/studio), describe your device in plain English, and click "Flash via USB" or download the generated .ino sketch.`,
  },
  {
    id: 'motherboard',
    title: '2. 14-Port Motherboard Pinout',
    content: `Ports S1..S6 (Top Row): Shared I²C0 (SDA=GPIO8, SCL=GPIO9) + dedicated GPIO/ADC channel per slot.
Ports S7..S8 (Mid Edge): High-speed SPI2 + I²C0 + PWM capable timer channels.
Ports S9..S14 (Bottom Row): Shared I²C1 + dedicated interrupt-capable GPIO + 3.3V / 500mA smart load switch.`,
  },
  {
    id: 'sdk',
    title: '3. C++ Firmware SDK Reference',
    content: `#include <Atech.h>

AtechBoard board;
OledDisplay oled(SLOT_S3);
RotaryEncoder dial(SLOT_S10);
EnvSensor env(SLOT_S1);

void setup() {
  board.begin();      // Auto-enumerates all 14 magnetic ports
  oled.clear();
  oled.drawTitle("ATECH OS v2.4");
}

void loop() {
  board.poll();       // Non-blocking 100Hz sensor & input scan
  if (dial.turned()) {
    oled.printf(0, 24, "Temp: %.1f C", env.readTempC());
    oled.flush();
  }
}`,
  },
  {
    id: 'wifi-bridge',
    title: '4. WiFi Gateway & HTTP Webhook Bridge',
    content: `Every firmware project can enable the Atech WiFi Gateway:
- Inbound HTTP Server: Listens on port 80 for JSON commands (POST /command, POST /display, GET /telemetry).
- Outbound Webhooks: Trigger HTTP GET/POST requests to Slack, Discord, Home Assistant, or custom APIs when a button is pressed or a sensor crosses a threshold.`,
  },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState(DOC_SECTIONS[0].id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
            DEVELOPER DOCUMENTATION
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold mt-1">
            Hardware & Firmware Docs
          </h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
            Complete reference for the 14-port ESP32-S3 motherboard, magnetic module bus
            protocol, C++ SDK, Coding Agent Prompt, and MCP Server.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <Link
            href="/coding-agent-prompt"
            className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Coding Agent Prompt →
          </Link>
          <Link
            href="/mcp"
            className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            MCP Server →
          </Link>
          <a
            href="/llms.txt"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-mono"
          >
            /llms.txt
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-2">
          {DOC_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                activeTab === s.id
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-teal-500'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-4">
          {DOC_SECTIONS.filter((s) => s.id === activeTab).map((s) => (
            <div key={s.id} className="space-y-4">
              <h2 className="text-2xl font-display font-bold">{s.title}</h2>
              <pre className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {s.content}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Module Bus Quick Reference Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-display font-bold">
          21 Hardware Modules — Bus & Footprint Matrix
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 dark:bg-zinc-800/70 font-mono uppercase text-[10px] text-zinc-500">
              <tr>
                <th className="p-3">Module</th>
                <th className="p-3">Category</th>
                <th className="p-3">Interface / Address</th>
                <th className="p-3">Footprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {STORE_MODULES.map((m) => (
                <tr key={m.slug}>
                  <td className="p-3 font-semibold">
                    <Link href={`/modules/${m.slug}`} className="hover:text-teal-600">
                      {m.name}
                    </Link>
                  </td>
                  <td className="p-3 text-zinc-500">{m.category}</td>
                  <td className="p-3 font-mono">{m.pins}</td>
                  <td className="p-3 font-mono text-zinc-500">{m.footprint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
