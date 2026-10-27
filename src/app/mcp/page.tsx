'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const MCP_CONFIG = `{
  "mcpServers": {
    "atech-hardware": {
      "command": "npx",
      "args": ["-y", "@atech/mcp-server"],
      "env": {
        "ATECH_STUDIO_URL": "https://studio.atech.dev",
        "ATECH_SERIAL_PORT": "auto"
      }
    }
  }
}`;

export default function McpPage() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
          MODEL CONTEXT PROTOCOL
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
          Atech Hardware MCP Server
        </h1>
        <p className="text-sm text-zinc-500 mt-2">
          Give your local AI coding assistant direct access to your connected Atech
          motherboard, live sensor telemetry, 14-port slot map, and one-step USB firmware
          flashing.
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-semibold">
            .mcp.json / claude_desktop_config.json
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(MCP_CONFIG);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="px-3 py-1 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
          >
            {copied ? '✓ Copied' : 'Copy JSON'}
          </button>
        </div>
        <pre className="p-4 rounded-2xl bg-zinc-950 text-teal-300 font-mono text-xs overflow-x-auto">
          {MCP_CONFIG}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            tool: 'atech_list_connected_modules',
            desc: 'Scans the 14 magnetic ports on the attached ESP32-S3 motherboard and returns the exact part_id and slot mapping.',
          },
          {
            tool: 'atech_compile_and_flash',
            desc: 'Compiles an Arduino/ESP-IDF C++ sketch and flashes it over WebSerial/esptool with automatic bootloader reset.',
          },
          {
            tool: 'atech_read_serial_telemetry',
            desc: 'Streams live JSON sensor readings and debug logs from the hardware device back to your AI agent.',
          },
          {
            tool: 'atech_send_wifi_webhook',
            desc: 'Dispatches a test JSON payload to the device WiFi Gateway endpoint to verify inbound handlers.',
          },
        ].map((item) => (
          <div
            key={item.tool}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-1.5"
          >
            <div className="font-mono text-xs font-bold text-teal-600">{item.tool}</div>
            <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Link href="/docs" className="text-xs text-teal-600 font-semibold hover:underline">
          ← Back to Developer Docs
        </Link>
      </div>
    </div>
  );
}
