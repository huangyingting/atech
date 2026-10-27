'use client';

import React from 'react';
import Link from 'next/link';

export default function LearnMorePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
          PROMPT TO PRODUCT ARCHITECTURE
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold">
          How Atech Studio Works
        </h1>
        <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
          Traditional hardware prototyping requires breadboards, datasheets, pin-mux
          debugging, and brittle wiring. Atech unifies standardized magnetic hardware modules
          with a deterministic AI synthesis pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            step: '01 / PROMPT',
            title: 'Describe behavior in plain English',
            desc: 'Tell Studio what you want to build—like a Pomodoro timer with a rotary dial and OLED screen, or a CO2 desk monitor that posts to Slack.',
          },
          {
            step: '02 / ELECTRONICS',
            title: 'Automatic 14-Port Placement & 3D Twin',
            desc: 'The placement solver selects the required modules from the 63-part catalog, assigns collision-free slots S1–S14, and renders an interactive 3D digital twin.',
          },
          {
            step: '03 / FIRMWARE & WIFI',
            title: 'Synthesize C++ & Test in Browser',
            desc: 'Studio generates clean, non-blocking ESP32-S3 C++ firmware, lets you play with the live hardware emulator, and flashes over USB-C.',
          },
        ].map((s) => (
          <div
            key={s.step}
            className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-3"
          >
            <div className="text-xs font-mono font-bold text-teal-600">{s.step}</div>
            <h2 className="text-xl font-display font-bold">{s.title}</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-zinc-950 text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-display font-bold">Ready to build your first device?</h3>
          <p className="text-xs text-zinc-400">
            Start from a blank prompt or fork a verified community build.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/studio"
            className="px-5 py-2.5 rounded-full bg-teal-500 text-zinc-950 font-semibold text-xs"
          >
            Open Studio →
          </Link>
          <Link
            href="/community"
            className="px-5 py-2.5 rounded-full border border-zinc-700 text-white font-semibold text-xs"
          >
            Explore Community
          </Link>
        </div>
      </div>
    </div>
  );
}
