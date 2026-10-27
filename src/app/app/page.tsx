'use client';

import React from 'react';
import Link from 'next/link';

export default function CompanionAppPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
          MOBILE & DESKTOP BRIDGE
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold">Atech Companion App</h1>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Pair your Atech hardware over Bluetooth Low Energy (BLE 5.0) or Wi-Fi to stream
          live dashboards, push notifications, and flash OTA firmware updates from iOS,
          Android, macOS, or Windows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            platform: 'WebSerial & WebBLE (Instant)',
            badge: 'NO INSTALL NEEDED',
            desc: 'Flash firmware over USB-C and stream live telemetry directly inside Chrome, Edge, or Brave using Atech Studio.',
            cta: 'Open Web Studio →',
            href: '/studio',
          },
          {
            platform: 'iOS & Android Companion',
            badge: 'BLE 5.0 + PUSH ALERTS',
            desc: 'Receive phone notifications when your Atech motion, environmental, or timer build triggers an event.',
            cta: 'Configure WiFi Bridge →',
            href: '/docs',
          },
          {
            platform: 'macOS / Linux / Windows CLI',
            badge: 'DEVELOPER DAEMON',
            desc: 'Bridge local serial ports to Claude Code, Cursor, and automated hardware-in-the-loop test runners.',
            cta: 'View MCP Server →',
            href: '/mcp',
          },
        ].map((card) => (
          <div
            key={card.platform}
            className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 text-[10px] font-mono font-semibold">
                {card.badge}
              </span>
              <h2 className="text-xl font-display font-bold">{card.platform}</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">{card.desc}</p>
            </div>
            <Link
              href={card.href}
              className="inline-block text-xs font-semibold text-teal-600 hover:underline"
            >
              {card.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
