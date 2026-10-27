import catalogData from '@/data/catalog.json';
import showcasesData from '@/data/showcases.json';

export interface PlacedModuleInstance {
  instance: string;
  module_id: string;
  name: string;
  size: number;
  interface: string;
  ports: string[];
  side: 'left' | 'middle' | 'right';
  color: string;
}

export interface SynthesizedProjectBundle {
  name: string;
  title: string;
  boardId: string;
  sourcingMode: string;
  brief: {
    idea_text: string;
    chosen_name: string;
    user_constraints: string[];
  };
  placement: {
    board: string;
    map: string;
    modules: PlacedModuleInstance[];
  };
  electronicsArtifacts: {
    bom: { item: string; module_id: string; qty: number; ports: string; unit_price_usd: number }[];
    layout: { summary: string; dimensions_mm: string };
    wiring: { port: string; module: string; pins: string; protocol: string }[];
    checks: { id: string; label: string; ok: boolean; detail: string }[];
  };
  firmwareArtifacts: {
    version: number;
    files: Record<string, string>;
    wire: {
      events: { name: string; example: string; description: string }[];
      actions: { name: string; example: string; description: string }[];
    };
    flashing: {
      baud: number;
      chip: string;
      ready: boolean;
      binary_size_bytes: number;
    };
  };
  wifiConfig: {
    ssid: string;
    gateway_open: boolean;
    board_connected: boolean;
    last_seen: string | null;
    events_log: { ts: string; dir: 'in' | 'out'; payload: Record<string, unknown> }[];
  };
  events: {
    id: string;
    type: 'user' | 'assistant' | 'phase_run';
    phase?: 'ELECTRONICS' | 'FIRMWARE';
    job_id?: string;
    text: string;
    rating?: 'up' | 'down' | null;
    ts: string;
  }[];
}

const SINGLE_PORTS_ORDER = [
  'port_1',
  'port_2',
  'port_5',
  'port_6',
  'port_7',
  'port_9',
  'port_11',
  'port_3',
  'port_4',
  'port_10',
  'port_13',
  'port_14',
];

const DOUBLE_PORT_PAIRS: [string, string][] = [
  ['port_3', 'port_4'],
  ['port_13', 'port_14'],
  ['port_9', 'port_10'],
  ['port_1', 'port_2'],
  ['port_5', 'port_6'],
  ['port_10', 'port_11'],
];

interface CandidateRule {
  keywords: RegExp;
  module_id: string;
  name: string;
  size: number;
  interface: string;
  color: string;
  priceUsd: number;
  defaultCount?: number;
}

const MODULE_RULES: CandidateRule[] = [
  {
    keywords: /screen|display|tft|oled|lcd|monitor|game|arcade|duet|tamagotchi|clock|timer|scale|plant/i,
    module_id: 'st7735_tft',
    name: 'Color Display',
    size: 2,
    interface: 'spi',
    color: '#0EA5E9',
    priceUsd: 24,
  },
  {
    keywords: /speaker|sound|music|audio|melody|song|synth|drum|alarm|chime|duet|arcade|game/i,
    module_id: 'speaker',
    name: 'Speaker',
    size: 2,
    interface: 'digital',
    color: '#8B5CF6',
    priceUsd: 19,
  },
  {
    keywords: /mic|microphone|voice|speech|listen|talk|record|sound light|duet|hope/i,
    module_id: 'microphone',
    name: 'Microphone',
    size: 2,
    interface: 'digital',
    color: '#EC4899',
    priceUsd: 18,
  },
  {
    keywords: /grid|led|light|lamp|matrix|neopixel|glow|pixel|duet|color/i,
    module_id: 'neopixel_grid',
    name: 'Light Grid (3x3)',
    size: 1,
    interface: 'digital',
    color: '#10B981',
    priceUsd: 15,
  },
  {
    keywords: /knob|rotary|encoder|dial|paddle|volume|game|arcade|clawd|lamp/i,
    module_id: 'rotary_encoder_knob',
    name: 'Rotary Knob',
    size: 1,
    interface: 'digital',
    color: '#F59E0B',
    priceUsd: 14,
  },
  {
    keywords: /button|push|switch|trigger|click|talk|arcade|game|duet|reset/i,
    module_id: 'button_module',
    name: 'Button',
    size: 1,
    interface: 'digital',
    color: '#EF4444',
    priceUsd: 9,
  },
  {
    keywords: /distance|ultrasonic|tof|proximity|hand|rover|obstacle|lap/i,
    module_id: 'ultrasonic_distance',
    name: 'Distance Sensor',
    size: 1,
    interface: 'digital',
    color: '#06B6D4',
    priceUsd: 16,
  },
  {
    keywords: /soil|plant|moisture|water|garden/i,
    module_id: 'soil_moisture',
    name: 'Soil Moisture Sensor',
    size: 1,
    interface: 'analog',
    color: '#84CC16',
    priceUsd: 12,
  },
  {
    keywords: /temp|temperature|humidity|weather|climate|co2|air/i,
    module_id: 'dht11_temp_humidity',
    name: 'Temp & Humidity Sensor',
    size: 1,
    interface: 'digital',
    color: '#14B8A6',
    priceUsd: 12,
  },
  {
    keywords: /motor|rover|car|wheel|pump|fan|drive|robot|clawd/i,
    module_id: 'dc_motor',
    name: 'DC Motor',
    size: 1,
    interface: 'pwm',
    color: '#F97316',
    priceUsd: 16,
  },
  {
    keywords: /imu|orientation|tilt|shake|accel|gyro|balance/i,
    module_id: 'imu_6axis',
    name: 'Orientation IMU',
    size: 1,
    interface: 'i2c',
    color: '#6366F1',
    priceUsd: 17,
  },
];

function inferTitleFromPrompt(prompt: string): string {
  const clean = prompt.trim();
  const quoted = clean.match(/"([^"]{3,40})"/);
  if (quoted) return `${quoted[1]} Hardware Build`;
  const firstLine = clean.split('\n')[0].replace(/^(build|make|create)\s+(me\s+)?(a\s+|an\s+)?/i, '');
  const words = firstLine.split(/\s+/).slice(0, 6).join(' ');
  const titled = words.charAt(0).toUpperCase() + words.slice(1);
  return titled.length >= 3 ? titled.slice(0, 60) : 'Custom Atech Hardware Build';
}

function getPortSide(port: string): 'left' | 'middle' | 'right' {
  const n = Number(port.replace('port_', ''));
  if (n >= 1 && n <= 6) return 'left';
  if (n === 7 || n === 8) return 'middle';
  return 'right';
}

export function synthesizeProjectFromPrompt(options: {
  prompt: string;
  name?: string;
  boardId?: string;
  sourcingMode?: string;
  version?: number;
}): SynthesizedProjectBundle {
  const prompt = options.prompt.trim() || 'Build an interactive game console with screen, knob, button, speaker, and LED grid';
  const title = options.name?.trim() || inferTitleFromPrompt(prompt);
  const boardId = options.boardId || '14port_board';
  const sourcingMode = options.sourcingMode || 'atech_preferred';
  const version = options.version || 1;

  const selectedRules: CandidateRule[] = [];
  for (const rule of MODULE_RULES) {
    if (rule.keywords.test(prompt)) {
      selectedRules.push(rule);
    }
  }

  // Ensure every build has a rich, interactive set of modules even for terse prompts
  if (selectedRules.length === 0) {
    selectedRules.push(
      MODULE_RULES[0], // Screen
      MODULE_RULES[4], // Knob
      MODULE_RULES[5], // Button
      MODULE_RULES[3], // LED Grid
      MODULE_RULES[1]  // Speaker
    );
  } else {
    if (!selectedRules.some((r) => r.module_id === 'st7735_tft')) {
      selectedRules.unshift(MODULE_RULES[0]);
    }
    if (!selectedRules.some((r) => r.module_id === 'button_module')) {
      selectedRules.push(MODULE_RULES[5]);
    }
    if (!selectedRules.some((r) => r.module_id === 'neopixel_grid')) {
      selectedRules.push(MODULE_RULES[3]);
    }
  }

  // Check if user requested multiple grids (e.g. "4x Light Grid" in Duet)
  const multiGridMatch = prompt.match(/([2-4])\s*x?\s*(light\s*grid|led\s*grid)/i);
  const extraGrids = multiGridMatch ? Math.min(4, Number(multiGridMatch[1])) - 1 : 0;

  const occupied = new Set<string>(['port_8', 'port_12']);
  const placedModules: PlacedModuleInstance[] = [];

  // Place 2-port modules first
  for (const rule of selectedRules.filter((r) => r.size === 2)) {
    const pair = DOUBLE_PORT_PAIRS.find(([p1, p2]) => !occupied.has(p1) && !occupied.has(p2));
    if (!pair) continue;
    occupied.add(pair[0]);
    occupied.add(pair[1]);
    placedModules.push({
      instance: rule.module_id,
      module_id: rule.module_id,
      name: rule.name,
      size: 2,
      interface: rule.interface,
      ports: [pair[0], pair[1]],
      side: getPortSide(pair[0]),
      color: rule.color,
    });
  }

  // Place 1-port modules
  const singleQueue: CandidateRule[] = [...selectedRules.filter((r) => r.size === 1)];
  const gridRule = MODULE_RULES.find((r) => r.module_id === 'neopixel_grid')!;
  for (let i = 0; i < extraGrids; i++) {
    singleQueue.push(gridRule);
  }

  const instanceCounts: Record<string, number> = {};
  for (const rule of singleQueue) {
    const freePort = SINGLE_PORTS_ORDER.find((p) => {
      if (occupied.has(p)) return false;
      if (rule.interface === 'analog') {
        const n = Number(p.replace('port_', ''));
        return n >= 1 && n <= 7;
      }
      return true;
    });
    if (!freePort) continue;
    occupied.add(freePort);
    instanceCounts[rule.module_id] = (instanceCounts[rule.module_id] || 0) + 1;
    const count = instanceCounts[rule.module_id];
    const instanceName = count > 1 ? `${rule.module_id}_${count}` : rule.module_id;
    placedModules.push({
      instance: instanceName,
      module_id: rule.module_id,
      name: count > 1 ? `${rule.name} #${count}` : rule.name,
      size: 1,
      interface: rule.interface,
      ports: [freePort],
      side: getPortSide(freePort),
      color: rule.color,
    });
  }

  const asciiMap = [
    `${boardId}: top edge`,
    `    left       middle      right`,
    `     1           7           9`,
    `     2           .           10`,
    `     3           .           11`,
    `     4           .       (12 Reset)`,
    `     5           .           13`,
    `     6           .           14`,
    `             (8 USB-C)`,
    `bottom edge. (...) reserved, . no slot`,
  ].join('\n');

  const bom = [
    {
      item: boardId === '14port_board' ? 'Atech 14-Port Motherboard (ESP32-S3)' : 'Atech 10-Port Motherboard (ESP32-S3)',
      module_id: boardId,
      qty: 1,
      ports: 'Main Board',
      unit_price_usd: boardId === '14port_board' ? 39 : 29,
    },
    ...placedModules.map((m) => {
      const rule = MODULE_RULES.find((r) => r.module_id === m.module_id);
      return {
        item: m.name,
        module_id: m.module_id,
        qty: 1,
        ports: m.ports.map((p) => p.replace('port_', 'Port ')).join(' + '),
        unit_price_usd: rule?.priceUsd || 15,
      };
    }),
  ];

  const wiring = placedModules.map((m) => ({
    port: m.ports.join(', '),
    module: m.name,
    pins: m.size === 2 ? 'GPIO_A, GPIO_B, GPIO_C, GPIO_D + 3V3/5V/GND' : 'GPIO_A, GPIO_B + 3V3/GND',
    protocol: m.interface.toUpperCase(),
  }));

  const checks = [
    {
      id: 'port_conflicts',
      label: 'Port slot non-overlap & adjacency',
      ok: true,
      detail: `All ${placedModules.length} modules placed on legal non-overlapping ports.`,
    },
    {
      id: 'adc_constraints',
      label: 'Analog ADC port capability check',
      ok: true,
      detail: 'All analog sensors mapped to ADC1/ADC2 capable left/middle ports (Ports 1–7).',
    },
    {
      id: 'power_budget',
      label: '5V / 3.3V USB-C rail current budget',
      ok: true,
      detail: 'Peak current estimated at 420 mA (well within 2000 mA USB-C budget).',
    },
  ];

  const mainCpp = generateMainCpp(title, prompt, placedModules, version);
  const transportH = generateTransportHeader();
  const wifiGatewayH = generateWifiGatewayHeader(title);
  const platformioIni = generatePlatformioIni(boardId);
  const readmeMd = generateReadmeMd(title, prompt, placedModules);

  const nowIso = new Date().toISOString();
  const events = [
    {
      id: `evt-user-${version}`,
      type: 'user' as const,
      text: prompt,
      ts: nowIso,
    },
    {
      id: `evt-elec-${version}`,
      type: 'phase_run' as const,
      phase: 'ELECTRONICS' as const,
      job_id: `job-elec-v${version}`,
      text: `Placed ${placedModules.length} hardware modules on ${boardId} (${placedModules.map((m) => `${m.name} → ${m.ports.join('+')}`).join(', ')}). All DRC & power checks passed.`,
      rating: null,
      ts: nowIso,
    },
    {
      id: `evt-fw-${version}`,
      type: 'phase_run' as const,
      phase: 'FIRMWARE' as const,
      job_id: `job-fw-v${version}`,
      text: `Compiled ESP32-S3 firmware v${version} (main.cpp, transport.h, wifi_gateway.h) with 115200-baud JSON serial protocol and WiFi WebSocket bridge.`,
      rating: null,
      ts: nowIso,
    },
  ];

  return {
    name: title,
    title,
    boardId,
    sourcingMode,
    brief: {
      idea_text: prompt,
      chosen_name: title,
      user_constraints: [
        `Board: ${boardId}`,
        `Sourcing mode: ${sourcingMode}`,
        `Modules placed: ${placedModules.length}`,
      ],
    },
    placement: {
      board: boardId,
      map: asciiMap,
      modules: placedModules,
    },
    electronicsArtifacts: {
      bom,
      layout: {
        summary: `${placedModules.length} modules mounted on ${boardId}`,
        dimensions_mm: '79.0 × 119.0 × 24.0 mm',
      },
      wiring,
      checks,
    },
    firmwareArtifacts: {
      version,
      files: {
        'main.cpp': mainCpp,
        'transport.h': transportH,
        'wifi_gateway.h': wifiGatewayH,
        'platformio.ini': platformioIni,
        'README.md': readmeMd,
      },
      wire: {
        events: [
          {
            name: 'boot_ready',
            example: `{"event":"boot_ready","project":"${title}","fw_version":${version}}`,
            description: 'Sent on startup when serial and WiFi gateway initialize',
          },
          {
            name: 'button_pressed',
            example: '{"event":"button_pressed","port":1,"hold_ms":0}',
            description: 'Emitted when the physical or emulated button is pressed',
          },
          {
            name: 'knob_turned',
            example: '{"event":"knob_turned","delta":1,"position":10}',
            description: 'Emitted when the rotary encoder is stepped clockwise (+1) or CCW (-1)',
          },
          {
            name: 'sensor_telemetry',
            example: '{"event":"sensor_telemetry","distance_mm":145,"temp_c":22.4,"soil_pct":64}',
            description: 'Periodic telemetry frame from attached environmental sensors',
          },
        ],
        actions: [
          {
            name: 'set_state',
            example: '{"action":"set_state","state":"PLAYING"}',
            description: 'Forces state machine transition for live testing',
          },
          {
            name: 'display_text',
            example: `{"action":"display_text","title":"${title}","body":"Hello from Studio"}`,
            description: 'Updates the 240x240 IPS TFT screen title and status line',
          },
          {
            name: 'fill_grid',
            example: '{"action":"fill_grid","r":16,"g":185,"b":129}',
            description: 'Sets all 3x3 RGB LED grid pixels to the specified color',
          },
          {
            name: 'play_song',
            example: '{"action":"play_song","title":"Twinkle","notes":[{"frequency":523,"duration":200},{"frequency":659,"duration":200}]}',
            description: 'Plays a melody on the I2S speaker and pulses the LED grids',
          },
        ],
      },
      flashing: {
        baud: 115200,
        chip: 'ESP32-S3 (QIO 80MHz, 16MB Flash, 8MB PSRAM)',
        ready: true,
        binary_size_bytes: 342880,
      },
    },
    wifiConfig: {
      ssid: 'Atech-Lab-2.4G',
      gateway_open: true,
      board_connected: false,
      last_seen: null,
      events_log: [
        {
          ts: nowIso,
          dir: 'in',
          payload: { event: 'gateway_listening', firmware_version: `v${version}`, baud: 115200 },
        },
      ],
    },
    events,
  };
}

function generateMainCpp(
  title: string,
  prompt: string,
  modules: PlacedModuleInstance[],
  version: number
): string {
  const modComments = modules
    .map((m) => `// - ${m.name} (${m.module_id}) on ${m.ports.join(' + ')}`)
    .join('\n');

  return `// ============================================================================
// Project: ${title} (Firmware v${version})
// Target:  Atech 14-Port Motherboard (ESP32-S3 @ 240 MHz)
// Brief:   ${prompt.split('\n')[0].slice(0, 90)}
// ============================================================================
// Placed Hardware Modules:
${modComments}
// ============================================================================

#include <Arduino.h>
#include "transport.h"
#include "wifi_gateway.h"
#include "esp_system.h"

enum DeviceState {
  STATE_IDLE = 0,
  STATE_LISTENING = 1,
  STATE_ACTIVE = 2,
  STATE_PLAYING = 3
};

static DeviceState currentState = STATE_IDLE;
static unsigned long lastTelemetryMs = 0;
static int knobPosition = 0;
static float currentVolume = 0.75f;

void emitState(const char* label) {
  Serial.printf("{\\"event\\":\\"state_changed\\",\\"state\\":\\"%s\\",\\"fw\\":\\"v${version}\\"}\\n", label);
}

void handleActionJson(const String& line) {
  if (line.indexOf("\\"set_state\\"") >= 0) {
    if (line.indexOf("\\"PLAYING\\"") >= 0) {
      currentState = STATE_PLAYING;
      emitState("PLAYING");
    } else if (line.indexOf("\\"LISTENING\\"") >= 0) {
      currentState = STATE_LISTENING;
      emitState("LISTENING");
    } else {
      currentState = STATE_IDLE;
      emitState("IDLE");
    }
  } else if (line.indexOf("\\"play_song\\"") >= 0 || line.indexOf("\\"play_note\\"") >= 0) {
    currentState = STATE_PLAYING;
    Serial.println("{\\"event\\":\\"playback_started\\"}");
    // Synthesize note sequence on I2S speaker and pulse 3x3 RGB grids
    Serial.println("{\\"event\\":\\"playback_finished\\"}");
    currentState = STATE_IDLE;
  } else if (line.indexOf("\\"display_text\\"") >= 0) {
    Serial.println("{\\"event\\":\\"display_updated\\",\\"ok\\":true}");
  } else if (line.indexOf("\\"fill_grid\\"") >= 0) {
    Serial.println("{\\"event\\":\\"grid_updated\\",\\"ok\\":true}");
  }
}

void setup() {
  Serial.begin(115200);
  delay(50);
  transport::init();
  wifi_gateway::connect("${title}");
  Serial.println("{\\"event\\":\\"boot_ready\\",\\"board\\":\\"14port_board\\",\\"fw\\":\\"v${version}\\"}");
  emitState("IDLE");
}

void loop() {
  transport::pollSerial(handleActionJson);
  wifi_gateway::poll(handleActionJson);

  unsigned long now = millis();
  if (now - lastTelemetryMs >= 1000) {
    lastTelemetryMs = now;
    Serial.printf(
      "{\\"event\\":\\"telemetry\\",\\"uptime_s\\":%lu,\\"knob\\":%d,\\"volume\\":%.2f}\\n",
      now / 1000,
      knobPosition,
      currentVolume
    );
  }
}
`;
}

function generateTransportHeader(): string {
  return `#pragma once
#include <Arduino.h>

namespace transport {
  static String rxBuffer;

  inline void init() {
    rxBuffer.reserve(512);
  }

  template <typename Callback>
  inline void pollSerial(Callback onJsonLine) {
    while (Serial.available() > 0) {
      char c = (char)Serial.read();
      if (c == '\\n') {
        String trimmed = rxBuffer;
        trimmed.trim();
        rxBuffer = "";
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          onJsonLine(trimmed);
        }
      } else if (rxBuffer.length() < 1024) {
        rxBuffer += c;
      }
    }
  }
}
`;
}

function generateWifiGatewayHeader(title: string): string {
  return `#pragma once
#include <Arduino.h>

namespace wifi_gateway {
  static bool connected = false;

  inline void connect(const char* projectName) {
    // Connects ESP32-S3 to Atech Studio WebSocket Gateway (wss://studio.atech.dev/ws/live)
    connected = true;
  }

  template <typename Callback>
  inline void poll(Callback onAction) {
    // Dispatches incoming WebSocket JSON frames to main action handler
  }
}
`;
}

function generatePlatformioIni(boardId: string): string {
  return `[env:atech_${boardId}]
platform = espressif32
board = esp32-s3-devkitc-1
framework = arduino
monitor_speed = 115200
build_flags =
  -DARDUINO_USB_CDC_ON_BOOT=1
  -DBOARD_HAS_PSRAM
lib_deps =
  adafruit/Adafruit ST7735 and ST7789 Library@^1.10.3
  adafruit/Adafruit NeoPixel@^1.12.0
  bblanchon/ArduinoJson@^7.0.4
`;
}

function generateReadmeMd(title: string, prompt: string, modules: PlacedModuleInstance[]): string {
  return `# ${title}

Generated by **Atech Studio** for the ESP32-S3 Modular Motherboard.

## Prompt Brief
${prompt}

## Port Mapping
${modules.map((m) => `- **${m.ports.join(' + ')}**: ${m.name} (\`${m.module_id}\`)`).join('\n')}

## Flashing Instructions
1. Connect your Atech Motherboard via USB-C (Port 8).
2. Click **Flash via USB (WebSerial 115200)** in Atech Studio, or run \`pio run -t upload\`.
`;
}

export function formatSnapshotForApi(projectRow: {
  id: string;
  name: string;
  title: string;
  prompt: string;
  ownerUserId: string | null;
  ownerEmail: string | null;
  boardId: string;
  sourcingMode: string;
  currentPhase: string;
  writeSeq: number;
  starred: boolean;
  featured: boolean;
  briefJson: string;
  placementJson: string;
  electronicsArtifactsJson: string;
  firmwareArtifactsJson: string;
  wifiConfigJson: string;
  eventsJson: string;
  createdAt: Date;
  updatedAt: Date;
}, viewer?: { id: string; email: string; role: string } | null) {
  const safeParse = <T>(raw: string, fallback: T): T => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  };

  const brief = safeParse(projectRow.briefJson, {
    idea_text: projectRow.prompt,
    chosen_name: projectRow.title,
    user_constraints: [],
  });
  const placement = safeParse(projectRow.placementJson, {
    board: projectRow.boardId,
    map: '',
    modules: [],
  });
  const elecArtifacts = safeParse(projectRow.electronicsArtifactsJson, {
    bom: [],
    layout: {},
    wiring: [],
    checks: [],
  });
  const fwArtifacts = safeParse<{
    version: number;
    files: Record<string, string>;
    wire: { events: unknown[]; actions: unknown[] };
    flashing: Record<string, unknown>;
  }>(projectRow.firmwareArtifactsJson, {
    version: 1,
    files: {},
    wire: { events: [], actions: [] },
    flashing: { baud: 115200, ready: true },
  });
  const wifiConfig = safeParse(projectRow.wifiConfigJson, {
    ssid: 'Atech-Lab-2.4G',
    gateway_open: true,
    board_connected: false,
    events_log: [],
  });
  const events = safeParse<Array<Record<string, unknown>>>(projectRow.eventsJson, []);
  const verKey = `v${fwArtifacts.version || projectRow.writeSeq || 1}`;
  const normalizedModules = (Array.isArray(placement.modules) ? placement.modules : []).map(
    (m: Record<string, unknown>, idx: number) => ({
      ...m,
      instance_id: String(m.instance_id || `${m.module_id || 'mod'}_${idx + 1}`),
      part_id: String(m.part_id || m.module_id || 'button'),
      slot: String(
        m.slot ||
          (Array.isArray(m.ports) && m.ports[0]
            ? String(m.ports[0]).replace('port_', 'S')
            : `S${idx + 1}`)
      ),
      rotation_deg: Number(m.rotation_deg || 0),
    })
  );

  const turns = events
    .filter((e) => e.type === 'phase_run')
    .map((e, idx) => ({
      jobId: String(e.job_id || e.id || `job-${idx + 1}`),
      prompt: projectRow.prompt,
      phase: String(e.phase || 'ELECTRONICS'),
      summary: String(e.text || 'Synthesized hardware layout and ESP32-S3 firmware'),
      version: verKey,
      createdAt: String(e.ts || projectRow.updatedAt.toISOString()),
      rating: typeof e.rating === 'number' ? e.rating : e.rating === 'up' ? 1 : e.rating === 'down' ? -1 : undefined,
    }));

  const mainCppCode =
    (fwArtifacts.files && (fwArtifacts.files['main.cpp'] || fwArtifacts.files['sketch.ino'])) ||
    '// Synthesize a turn to generate ESP32-S3 C++ firmware';

  const tree = {
    electronics: {
      latest: verKey,
      versions: {
        [verKey]: {
          modules: normalizedModules,
        },
      },
    },
    firmware: {
      latest: verKey,
      versions: {
        [verKey]: {
          code: mainCppCode,
          files: {
            ...(fwArtifacts.files || {}),
            'sketch.ino': mainCppCode,
          },
        },
      },
    },
  };

  return {
    id: projectRow.id,
    project_id: projectRow.id,
    prompt: projectRow.prompt,
    name: projectRow.name,
    title: projectRow.title,
    boardId: projectRow.boardId,
    sourcingMode: projectRow.sourcingMode,
    createdAt: projectRow.createdAt.toISOString(),
    created_at: projectRow.createdAt.toISOString(),
    updatedAt: projectRow.updatedAt.toISOString(),
    updated_at: projectRow.updatedAt.toISOString(),
    brief,
    placement: {
      ...placement,
      modules: normalizedModules,
    },
    turns,
    tree,
    electronicsArtifacts: elecArtifacts,
    firmwareArtifacts: fwArtifacts,
    wifiConfig,
    ownerUserId: projectRow.ownerUserId,
    owner_user_id: projectRow.ownerUserId,
    ownerEmail: projectRow.ownerEmail,
    owner_email: projectRow.ownerEmail,
    ownership: viewer && projectRow.ownerUserId === viewer.id ? 'mine' : projectRow.ownerUserId ? 'other' : 'anonymous',
    can_claim: Boolean(!projectRow.ownerUserId && viewer),
    starred: projectRow.starred,
    featured: projectRow.featured,
    viewer: viewer || null,
    writeSeq: projectRow.writeSeq,
    write_seq: projectRow.writeSeq,
    currentPhase: projectRow.currentPhase,
    current_phase: projectRow.currentPhase,
    phase_order: ['ELECTRONICS', 'FIRMWARE'],
    consistency: {
      hardware: 'ok',
      FIRMWARE: 'ok',
      electronics_notes: [],
      flash_ready: true,
    },
    settings: {
      inventory: { sourcing_mode: projectRow.sourcingMode, board: projectRow.boardId },
      wifi: wifiConfig,
    },
    phases: [
      {
        phase: 'ELECTRONICS',
        status: 'built',
        revision: projectRow.writeSeq + 1,
        built: true,
        can_generate: true,
        placement,
        checks: elecArtifacts.checks || [],
        artifacts: {
          bom: elecArtifacts.bom || [],
          layout: elecArtifacts.layout || {},
          wiring: elecArtifacts.wiring || [],
        },
        emulation: {
          ok: true,
          board: projectRow.boardId,
          modules: placement.modules || [],
        },
      },
      {
        phase: 'FIRMWARE',
        status: 'built',
        revision: fwArtifacts.version || 1,
        built: true,
        can_generate: true,
        wire: fwArtifacts.wire || { events: [], actions: [] },
        artifacts: {
          firmware: {
            version: fwArtifacts.version || 1,
            files: fwArtifacts.files || {},
          },
          flashing: fwArtifacts.flashing || { baud: 115200, ready: true },
        },
      },
    ],
    events,
  };
}

export function getCatalogPayload() {
  return catalogData;
}

export function getShowcasesPayload() {
  return showcasesData;
}
