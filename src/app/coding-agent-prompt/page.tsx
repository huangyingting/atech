'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const AGENT_PROMPT = `You are an expert embedded C++ firmware engineer targeting the Atech 14-Port ESP32-S3 Modular Motherboard.

## Hardware Architecture
- MCU: ESP32-S3 (Dual-core Xtensa LX7 @ 240MHz, 8MB PSRAM, 16MB QSPI Flash, native USB-C CDC/JTAG).
- Slots: 14 magnetic pogo-pin bays labeled SLOT_S1 through SLOT_S14.
- Power: 3.3V regulated rail + LiPo battery charger with fuel gauge on I²C0 (0x36).
- SDK Header: Always include \`#include <Atech.h>\` and call \`board.begin()\` in \`setup()\` and \`board.poll()\` in \`loop()\`.

## Supported Modules & Drivers
- OledDisplay(slot): 128x64 monochrome SSD1306 display (.clear(), .drawTitle(), .printf(), .flush())
- ColorTft(slot): 240x240 IPS ST7789 RGB display
- PushButton(slot): Momentary tactile button (.pressed(), .held(), .released())
- RotaryEncoder(slot): Detented quadrature dial + push switch (.delta(), .pressed())
- ThumbJoystick(slot): Dual-axis analog stick (.x(), .y(), .pressed())
- Imu6Axis(slot): 6-DoF accelerometer + gyroscope (.pitch(), .roll(), .shakeDetected())
- EnvSensor(slot): Temperature, humidity, barometric pressure (.readTempC(), .readHumidity(), .readPressureHpa())
- TofLaser(slot): Millimeter Time-of-Flight ranging sensor (.readMillimeters())
- PiezoBuzzer(slot): Frequency-synthesized tone generator (.tone(hz, ms))
- RgbLedBar(slot): Addressable WS2812B LEDs (.setPixel(idx, r, g, b), .show())

## Firmware Coding Rules
1. Never use blocking \`delay()\` calls longer than 10ms inside \`loop()\`; use \`millis()\` state machines so 100Hz input polling stays responsive.
2. Always render a status header on the primary display showing active mode and sensor state.
3. Expose JSON telemetry over USB Serial at 115200 baud and via \`WifiGateway\` when requested.`;

export default function CodingAgentPromptPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(AGENT_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
            AI ENGINEERING WORKFLOW
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Coding Agent System Prompt
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Paste this system prompt into Claude Code, GitHub Copilot, Cursor, or ChatGPT to
            generate 100% compatible Atech C++ firmware locally.
          </p>
        </div>
        <button
          onClick={handleCopy}
          data-testid="copy-agent-prompt"
          className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
        >
          {copied ? '✓ Copied to Clipboard' : 'Copy System Prompt'}
        </button>
      </div>

      <pre className="p-6 rounded-3xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap border border-zinc-800">
        {AGENT_PROMPT}
      </pre>

      <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
        <Link href="/docs" className="hover:text-teal-600">
          ← Back to Documentation
        </Link>
        <Link href="/mcp" className="text-teal-600 font-semibold hover:underline">
          Next: Model Context Protocol (MCP) Server →
        </Link>
      </div>
    </div>
  );
}
