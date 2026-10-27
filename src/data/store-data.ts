export interface CurrencySpec {
  countryCode: string;
  countryName: string;
  currency: string;
  symbol: string;
  rateFromUsd: number;
  zeroDecimal?: boolean;
}

export const REGIONAL_CURRENCIES: CurrencySpec[] = [
  { countryCode: 'US', countryName: 'United States', currency: 'USD', symbol: '$', rateFromUsd: 1 },
  { countryCode: 'DK', countryName: 'Denmark', currency: 'DKK', symbol: 'kr.', rateFromUsd: 6.95 },
  { countryCode: 'DE', countryName: 'Eurozone (EUR)', currency: 'EUR', symbol: '€', rateFromUsd: 0.92 },
  { countryCode: 'GB', countryName: 'United Kingdom', currency: 'GBP', symbol: '£', rateFromUsd: 0.79 },
  { countryCode: 'SE', countryName: 'Sweden', currency: 'SEK', symbol: 'kr', rateFromUsd: 10.6 },
  { countryCode: 'NO', countryName: 'Norway', currency: 'NOK', symbol: 'kr', rateFromUsd: 10.9 },
  { countryCode: 'SG', countryName: 'Singapore', currency: 'SGD', symbol: 'S$', rateFromUsd: 1.34 },
  { countryCode: 'CA', countryName: 'Canada', currency: 'CAD', symbol: 'CA$', rateFromUsd: 1.38 },
  { countryCode: 'AU', countryName: 'Australia', currency: 'AUD', symbol: 'A$', rateFromUsd: 1.52 },
  { countryCode: 'CH', countryName: 'Switzerland', currency: 'CHF', symbol: 'CHF ', rateFromUsd: 0.88 },
  { countryCode: 'JP', countryName: 'Japan', currency: 'JPY', symbol: '¥', rateFromUsd: 154, zeroDecimal: true },
  { countryCode: 'KR', countryName: 'South Korea', currency: 'KRW', symbol: '₩', rateFromUsd: 1380, zeroDecimal: true },
  { countryCode: 'BR', countryName: 'Brazil', currency: 'BRL', symbol: 'R$', rateFromUsd: 5.15 },
  { countryCode: 'IN', countryName: 'India', currency: 'INR', symbol: '₹', rateFromUsd: 83.5, zeroDecimal: true },
  { countryCode: 'PL', countryName: 'Poland', currency: 'PLN', symbol: 'zł', rateFromUsd: 3.98 },
];

export function formatPriceUsd(usdAmount: number, countryCode = 'US'): string {
  const spec =
    REGIONAL_CURRENCIES.find((c) => c.countryCode === countryCode || c.currency === countryCode) ||
    REGIONAL_CURRENCIES[0];
  const converted = usdAmount * spec.rateFromUsd;
  const rounded = spec.zeroDecimal ? Math.round(converted / 10) * 10 : Math.round(converted);
  return `${spec.symbol}${rounded.toLocaleString('en-US')} ${spec.currency}`;
}

export interface KitItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  badge?: string;
  moduleCount: number;
  priceUsd: number;
  shippingNote: string;
  description: string;
  boardSlug: string;
  includedModules: { slug: string; name: string; qty: number; ports: number }[];
  defaultPortPlacement: { port: string; moduleSlug: string; label: string }[];
}

export const STORE_KITS: KitItem[] = [
  {
    id: 'kit-small',
    slug: 'small-kit',
    name: 'Small Kit',
    tagline: 'Everything to build your first smart gadgets & games',
    moduleCount: 10,
    priceUsd: 99,
    shippingNote: 'Ships worldwide in 3–5 business days',
    description:
      'Includes the 10-Port ESP32-S3 Motherboard, Color Screen, Rotary Knob, Speaker, RGB LED Grid, Button, Temperature Sensor, Distance Sensor, USB-C Power/Data module, and modular frame.',
    boardSlug: 'motherboard-10port',
    includedModules: [
      { slug: 'motherboard-10port', name: '10-Port Motherboard (ESP32-S3)', qty: 1, ports: 0 },
      { slug: 'screen', name: 'Color Screen (1.54" IPS TFT)', qty: 1, ports: 2 },
      { slug: 'knob', name: 'Rotary Knob Encoder', qty: 1, ports: 1 },
      { slug: 'speaker', name: 'Digital I2S Speaker', qty: 1, ports: 2 },
      { slug: 'led-grid', name: '3×3 RGB LED Grid', qty: 2, ports: 1 },
      { slug: 'button', name: 'Tactile Push Button', qty: 1, ports: 1 },
      { slug: 'temp-sensor', name: 'Temperature & Humidity Sensor', qty: 1, ports: 1 },
      { slug: 'distance-sensor', name: 'Laser Distance Sensor (ToF)', qty: 1, ports: 1 },
    ],
    defaultPortPlacement: [
      { port: 'port_1', moduleSlug: 'button', label: 'Button' },
      { port: 'port_3', moduleSlug: 'screen', label: 'Color Screen (2p)' },
      { port: 'port_5', moduleSlug: 'knob', label: 'Knob' },
      { port: 'port_9', moduleSlug: 'speaker', label: 'Speaker (2p)' },
      { port: 'port_13', moduleSlug: 'led-grid', label: 'LED Grid' },
    ],
  },
  {
    id: 'kit-big',
    slug: 'big-kit',
    name: 'Big Kit',
    tagline: 'Our complete workbench for robotics, audio, and environmental AI builds',
    badge: 'Most popular',
    moduleCount: 20,
    priceUsd: 149,
    shippingNote: 'Ships worldwide in 3–5 business days',
    description:
      'Includes the flagship 14-Port ESP32-S3 Motherboard plus 20 snap-in modules including Color Screen, Microphone, Speaker, 4× LED Grids, Soil Sensor, CO2 Sensor, Orientation IMU, DC Motor, Knob, Buttons, and Frame.',
    boardSlug: 'motherboard-14port',
    includedModules: [
      { slug: 'motherboard-14port', name: '14-Port Motherboard (ESP32-S3)', qty: 1, ports: 0 },
      { slug: 'screen', name: 'Color Screen (1.54" IPS TFT)', qty: 1, ports: 2 },
      { slug: 'speaker', name: 'Digital I2S Speaker', qty: 1, ports: 2 },
      { slug: 'microphone', name: 'Digital MEMS Microphone', qty: 1, ports: 2 },
      { slug: 'led-grid', name: '3×3 RGB LED Grid', qty: 4, ports: 1 },
      { slug: 'knob', name: 'Rotary Knob Encoder', qty: 2, ports: 1 },
      { slug: 'button', name: 'Tactile Push Button', qty: 2, ports: 1 },
      { slug: 'distance-sensor', name: 'Laser Distance Sensor (ToF)', qty: 1, ports: 1 },
      { slug: 'temp-sensor', name: 'Temperature & Humidity Sensor', qty: 1, ports: 1 },
      { slug: 'soil-sensor', name: 'Capacitive Soil Moisture Sensor', qty: 1, ports: 1 },
      { slug: 'co2-sensor', name: 'CO2 & TVOC Air Quality Sensor', qty: 1, ports: 1 },
      { slug: 'orientation-sensor', name: '6-Axis IMU Orientation Sensor', qty: 1, ports: 1 },
      { slug: 'dc-motor', name: 'Bidirectional DC Motor Driver', qty: 2, ports: 1 },
    ],
    defaultPortPlacement: [
      { port: 'port_1', moduleSlug: 'led-grid', label: 'LED Grid 1' },
      { port: 'port_2', moduleSlug: 'led-grid', label: 'LED Grid 2' },
      { port: 'port_3', moduleSlug: 'screen', label: 'Color Screen (2p)' },
      { port: 'port_5', moduleSlug: 'distance-sensor', label: 'Distance' },
      { port: 'port_6', moduleSlug: 'button', label: 'Button' },
      { port: 'port_7', moduleSlug: 'knob', label: 'Knob' },
      { port: 'port_9', moduleSlug: 'led-grid', label: 'LED Grid 3' },
      { port: 'port_10', moduleSlug: 'microphone', label: 'Microphone (2p)' },
      { port: 'port_13', moduleSlug: 'speaker', label: 'Speaker (2p)' },
    ],
  },
  {
    id: 'kit-chunky',
    slug: 'chunky-kit',
    name: 'Chunky Kit',
    tagline: 'Dual-motherboard studio bundle with Robot Arm, Camera, Big Screen & Load Cell',
    badge: 'Free international shipping',
    moduleCount: 30,
    priceUsd: 379,
    shippingNote: 'Free priority international shipping included',
    description:
      'Built for labs, multi-unit connected devices (like Duet), and robotics. Includes both 14-Port and 10-Port ESP32-S3 Motherboards plus 30 modules including the 3-DOF Robot Arm, Camera, Big Screen, Load Cell, MicroSD, and Power Jack.',
    boardSlug: 'motherboard-14port',
    includedModules: [
      { slug: 'motherboard-14port', name: '14-Port Motherboard (ESP32-S3)', qty: 2, ports: 0 },
      { slug: 'motherboard-10port', name: '10-Port Motherboard (ESP32-S3)', qty: 1, ports: 0 },
      { slug: 'robot-arm', name: '3-DOF Servo Robot Arm', qty: 1, ports: 2 },
      { slug: 'big-screen', name: '2.8" High-Resolution IPS Display', qty: 1, ports: 2 },
      { slug: 'camera', name: 'OV2640 Machine Vision Camera', qty: 1, ports: 2 },
      { slug: 'screen', name: 'Color Screen (1.54" IPS TFT)', qty: 2, ports: 2 },
      { slug: 'speaker', name: 'Digital I2S Speaker', qty: 2, ports: 2 },
      { slug: 'microphone', name: 'Digital MEMS Microphone', qty: 2, ports: 2 },
      { slug: 'led-grid', name: '3×3 RGB LED Grid', qty: 6, ports: 1 },
      { slug: 'load-cell', name: 'Precision Load Cell Weight Sensor', qty: 1, ports: 1 },
      { slug: 'co2-sensor', name: 'CO2 & TVOC Air Quality Sensor', qty: 2, ports: 1 },
      { slug: 'soil-sensor', name: 'Capacitive Soil Moisture Sensor', qty: 2, ports: 1 },
      { slug: 'dc-motor', name: 'Bidirectional DC Motor Driver', qty: 4, ports: 1 },
      { slug: 'micro-sd', name: 'MicroSD Data Logger Module', qty: 1, ports: 1 },
      { slug: 'power-jack', name: 'High-Current Barrel Power Jack', qty: 1, ports: 1 },
      { slug: 'frame-2', name: 'Modular Aluminum Enclosure Frame', qty: 2, ports: 0 },
    ],
    defaultPortPlacement: [
      { port: 'port_1', moduleSlug: 'robot-arm', label: 'Robot Arm (2p)' },
      { port: 'port_3', moduleSlug: 'big-screen', label: 'Big Screen (2p)' },
      { port: 'port_5', moduleSlug: 'load-cell', label: 'Load Cell' },
      { port: 'port_6', moduleSlug: 'co2-sensor', label: 'CO2 Sensor' },
      { port: 'port_7', moduleSlug: 'knob', label: 'Knob' },
      { port: 'port_9', moduleSlug: 'camera', label: 'Camera (2p)' },
      { port: 'port_11', moduleSlug: 'button', label: 'Button' },
      { port: 'port_13', moduleSlug: 'speaker', label: 'Speaker (2p)' },
    ],
  },
];

export interface StoreModuleSpec {
  slug: string;
  catalogId: string;
  name: string;
  category: 'board' | 'display' | 'audio' | 'input' | 'led' | 'sensor' | 'motor' | 'robotics' | 'power' | 'storage' | 'enclosure';
  portsOccupied: number;
  priceUsd: number;
  shortDesc: string;
  fullDesc: string;
  interfaceType: string;
  dimensionsMm: string;
  chipset: string;
  events: { name: string; payload: string; description: string }[];
  actions: { name: string; payload: string; description: string }[];
}

export const STORE_MODULES: StoreModuleSpec[] = [
  {
    slug: 'motherboard-14port',
    catalogId: '14port_board',
    name: '14-Port Motherboard',
    category: 'board',
    portsOccupied: 0,
    priceUsd: 39,
    shortDesc: 'Flagship ESP32-S3 dual-core 240 MHz motherboard with 12 modular snap-in ports, USB-C, and Wi-Fi/BLE.',
    fullDesc:
      'The heart of the Atech system. Powered by an ESP32-S3-WROOM-1 with 8 MB Octal PSRAM and 16 MB Flash. Ports 1–7, 9–11, and 13–14 accept single-width or double-width snap-in modules with reverse-polarity protection. Port 8 houses high-speed USB-C (115200 baud serial + LiPo charging) and Port 12 houses the recessed hardware reset switch.',
    interfaceType: 'USB-C / Wi-Fi 2.4GHz / BLE 5.0',
    dimensionsMm: '79.0 × 119.0 × 12.0 mm',
    chipset: 'ESP32-S3-WROOM-1 (240 MHz Dual-Core)',
    events: [{ name: 'boot_ready', payload: '{"event":"boot_ready","board":"14port_board","fw":"v11"}', description: 'Emitted on power-up or reset' }],
    actions: [{ name: 'ping', payload: '{"action":"ping"}', description: 'Requests immediate heartbeat & port inventory' }],
  },
  {
    slug: 'motherboard-10port',
    catalogId: '8port_board',
    name: '10-Port Motherboard',
    category: 'board',
    portsOccupied: 0,
    priceUsd: 29,
    shortDesc: 'Compact ESP32-S3 motherboard for handheld games, wearables, and compact sensor nodes.',
    fullDesc:
      'Shares the identical ESP32-S3 architecture and 115200-baud JSON wire protocol as the 14-port board in a smaller footprint ideal for pocket consoles and compact desktop instruments.',
    interfaceType: 'USB-C / Wi-Fi 2.4GHz / BLE 5.0',
    dimensionsMm: '79.0 × 79.0 × 12.0 mm',
    chipset: 'ESP32-S3-WROOM-1',
    events: [{ name: 'boot_ready', payload: '{"event":"boot_ready","board":"10port_board"}', description: 'Emitted on power-up' }],
    actions: [{ name: 'ping', payload: '{"action":"ping"}', description: 'Requests board status' }],
  },
  {
    slug: 'robot-arm',
    catalogId: 'robot_arm',
    name: 'Robot Arm',
    category: 'robotics',
    portsOccupied: 2,
    priceUsd: 49,
    shortDesc: '3-DOF articulated desktop servo arm with precision joint angle control and gripper.',
    fullDesc:
      'A double-width module featuring three closed-loop micro servos for base rotation, shoulder elevation, and reach/gripper actuation. Controlled directly via JSON angle commands.',
    interfaceType: 'Digital PWM (2 ports)',
    dimensionsMm: '39.5 × 39.5 × 115.0 mm',
    chipset: 'PCA9685 + 3× MG90S Metal Gear Servos',
    events: [{ name: 'pose_reached', payload: '{"event":"pose_reached","j1":90,"j2":45,"j3":110}', description: 'Fired when target joint interpolation finishes' }],
    actions: [{ name: 'set_joint_angles', payload: '{"action":"set_joint_angles","j1":90,"j2":45,"j3":110,"speed":60}', description: 'Moves all 3 joints smoothly to target degrees (0–180)' }],
  },
  {
    slug: 'soil-sensor',
    catalogId: 'soil_moisture',
    name: 'Soil Sensor',
    category: 'sensor',
    portsOccupied: 1,
    priceUsd: 12,
    shortDesc: 'Corrosion-resistant capacitive soil moisture probe for smart planters and greenhouses.',
    fullDesc:
      'Measures dielectric permittivity of soil without exposed metal electrodes, providing calibrated 0–100% volumetric moisture readings on any ADC-capable port (Ports 1–7).',
    interfaceType: 'Analog ADC (Ports 1–7)',
    dimensionsMm: '19.5 × 60.0 × 8.5 mm',
    chipset: 'Capacitive 555 Excitation + Low-Pass Filter',
    events: [{ name: 'soil_moisture', payload: '{"event":"soil_moisture","port":2,"percent":64,"raw":1840}', description: 'Periodic or threshold-triggered moisture reading' }],
    actions: [{ name: 'read_soil', payload: '{"action":"read_soil","port":2}', description: 'Triggers immediate moisture sample' }],
  },
  {
    slug: 'knob',
    catalogId: 'rotary_encoder_knob',
    name: 'Knob',
    category: 'input',
    portsOccupied: 1,
    priceUsd: 14,
    shortDesc: 'Detented quadrature rotary encoder with machined aluminum cap for menus, volume, and games.',
    fullDesc:
      'Outputs clean hardware-debounced step deltas (+1 clockwise, -1 counter-clockwise) and absolute position counters for responsive UI navigation and paddle games.',
    interfaceType: 'Digital Quadrature (2 GPIO)',
    dimensionsMm: '19.5 × 19.5 × 24.0 mm',
    chipset: 'EC11 Quadrature Encoder + Schmitt Trigger',
    events: [{ name: 'knob_turned', payload: '{"event":"knob_turned","port":5,"delta":1,"position":18}', description: 'Emitted on each detent step' }],
    actions: [{ name: 'reset_knob', payload: '{"action":"reset_knob","port":5,"position":0}', description: 'Resets accumulated encoder position' }],
  },
  {
    slug: 'screen',
    catalogId: 'st7735_tft',
    name: 'Screen',
    category: 'display',
    portsOccupied: 2,
    priceUsd: 24,
    shortDesc: 'Crisp full-color IPS TFT display (2 ports) for dashboards, animations, and arcade games.',
    fullDesc:
      'High-contrast SPI color display driven via DMA for tear-free text, charts, sprites, and status cards. Occupies two adjacent ports.',
    interfaceType: 'High-Speed SPI (2 ports)',
    dimensionsMm: '39.5 × 39.5 × 11.2 mm',
    chipset: 'ST7789 / ST7735 IPS TFT Controller',
    events: [{ name: 'display_ready', payload: '{"event":"display_ready","width":240,"height":240}', description: 'Framebuffer initialized' }],
    actions: [
      { name: 'display_text', payload: '{"action":"display_text","title":"Duet","body":"Hold button to record"}', description: 'Renders formatted title and body text' },
      { name: 'draw_rect', payload: '{"action":"draw_rect","x":10,"y":40,"w":100,"h":12,"color":"#10B981"}', description: 'Draws filled rectangle or progress bar' },
    ],
  },
  {
    slug: 'speaker',
    catalogId: 'speaker',
    name: 'Speaker',
    category: 'audio',
    portsOccupied: 2,
    priceUsd: 19,
    shortDesc: 'Digital I2S Class-D amplifier and tuned enclosure speaker for melodies, speech, and alerts.',
    fullDesc:
      'Delivers clear polyphonic tones, retro game sound effects, and streamed audio over digital I2S with programmable software volume control (0.0 to 1.0).',
    interfaceType: 'Digital I2S / PWM (2 ports)',
    dimensionsMm: '39.5 × 39.5 × 16.5 mm',
    chipset: 'MAX98357A Digital I2S Amp + 2W Driver',
    events: [{ name: 'playback_finished', payload: '{"event":"playback_finished"}', description: 'Emitted when note sequence completes' }],
    actions: [
      { name: 'play_note', payload: '{"action":"play_note","frequency":523,"duration_ms":200}', description: 'Plays a tone at frequency (Hz) for duration (ms)' },
      { name: 'set_volume', payload: '{"action":"set_volume","level":0.75}', description: 'Sets output gain between 0.0 and 1.0' },
    ],
  },
  {
    slug: 'microphone',
    catalogId: 'microphone',
    name: 'Microphone',
    category: 'audio',
    portsOccupied: 2,
    priceUsd: 18,
    shortDesc: 'Omnidirectional digital MEMS microphone for voice commands, sound-level meters, and beat detection.',
    fullDesc:
      'Captures high-SNR digital audio and computes real-time RMS sound pressure levels (`sound_level` 0–100) and spectral energy bands directly on the ESP32-S3.',
    interfaceType: 'Digital I2S (2 ports)',
    dimensionsMm: '39.5 × 19.5 × 10.8 mm',
    chipset: 'INMP441 24-bit I2S MEMS Microphone',
    events: [{ name: 'sound_level', payload: '{"event":"sound_level","port":10,"level":72,"db":-14.2}', description: 'Real-time voice/ambient amplitude (0–100)' }],
    actions: [{ name: 'set_mic_threshold', payload: '{"action":"set_mic_threshold","level":35}', description: 'Configures trigger floor for voice activity' }],
  },
  {
    slug: 'dc-motor',
    catalogId: 'dc_motor',
    name: 'DC Motor',
    category: 'motor',
    portsOccupied: 1,
    priceUsd: 16,
    shortDesc: 'H-bridge driver + geared DC motor with forward/reverse PWM speed control.',
    fullDesc:
      'Drives wheels, fans, pumps, and winches with smooth -100% to +100% duty-cycle control and integrated over-current thermal protection.',
    interfaceType: 'Digital PWM H-Bridge (1 port)',
    dimensionsMm: '19.5 × 39.5 × 22.0 mm',
    chipset: 'DRV8833 Dual H-Bridge + N20 Gearmotor',
    events: [{ name: 'motor_stall', payload: '{"event":"motor_stall","port":1}', description: 'Reported if current limit is reached' }],
    actions: [{ name: 'set_speed', payload: '{"action":"set_speed","port":1,"speed":80}', description: 'Sets motor speed from -100 (reverse) to +100 (forward)' }],
  },
  {
    slug: 'led-grid',
    catalogId: 'neopixel_grid',
    name: 'LED Grid',
    category: 'led',
    portsOccupied: 1,
    priceUsd: 15,
    shortDesc: '3×3 matrix of individually addressable RGB LEDs with diffuser faceplate.',
    fullDesc:
      'Nine vivid WS2812B RGB pixels arranged in a 3×3 grid. Chain or place multiple grids across ports for level meters, status icons, ambient mood lighting, and pixel art.',
    interfaceType: 'Single-Wire Digital RGB (1 port)',
    dimensionsMm: '19.5 × 19.5 × 9.2 mm',
    chipset: '9× WS2812B Addressable RGB LEDs',
    events: [],
    actions: [
      { name: 'set_pixel', payload: '{"action":"set_pixel","port":9,"x":1,"y":1,"r":16,"g":185,"b":129}', description: 'Sets color of pixel (x: 0..2, y: 0..2)' },
      { name: 'fill_grid', payload: '{"action":"fill_grid","port":9,"r":59,"g":130,"b":246}', description: 'Fills all 9 LEDs with RGB color' },
    ],
  },
  {
    slug: 'button',
    catalogId: 'button_module',
    name: 'Button',
    category: 'input',
    portsOccupied: 1,
    priceUsd: 9,
    shortDesc: 'Crisp tactile mechanical push button with hardware debounce and hold-duration timing.',
    fullDesc:
      'Reports instant press, release, short-tap, and long-hold duration in milliseconds (`hold_ms`) for push-to-talk, game fire buttons, and mode toggles.',
    interfaceType: 'Digital GPIO (1 port)',
    dimensionsMm: '19.5 × 19.5 × 14.0 mm',
    chipset: 'Kailh Tactile Switch + RC Debounce',
    events: [
      { name: 'button_pressed', payload: '{"event":"button_pressed","port":7}', description: 'Emitted immediately on key down' },
      { name: 'button_released', payload: '{"event":"button_released","port":7,"hold_ms":640}', description: 'Emitted on release with elapsed hold duration' },
    ],
    actions: [],
  },
  {
    slug: 'distance-sensor',
    catalogId: 'ultrasonic_distance',
    name: 'Distance Sensor',
    category: 'sensor',
    portsOccupied: 1,
    priceUsd: 16,
    shortDesc: 'Millimeter-accurate proximity and gesture ranging sensor (20 mm – 2000 mm).',
    fullDesc:
      'Measures hand height for theremin/volume control, obstacle avoidance on rovers, and desk presence detection without mechanical contact.',
    interfaceType: 'Digital Pulse / I2C (1 port)',
    dimensionsMm: '19.5 × 19.5 × 13.5 mm',
    chipset: 'VL53L0X ToF / Precision Ultrasonic Transceiver',
    events: [{ name: 'distance_mm', payload: '{"event":"distance_mm","port":6,"value":145}', description: 'Distance to target in millimeters' }],
    actions: [{ name: 'set_range_rate', payload: '{"action":"set_range_rate","port":6,"hz":15}', description: 'Sets measurement polling frequency' }],
  },
  {
    slug: 'orientation-sensor',
    catalogId: 'imu_6axis',
    name: 'Orientation Sensor',
    category: 'sensor',
    portsOccupied: 1,
    priceUsd: 17,
    shortDesc: '6-axis accelerometer and gyroscope IMU for tilt, roll, pitch, and shake detection.',
    fullDesc:
      'Tracks 3D board orientation, free-fall, tap gestures, and angular velocity for motion-controlled games, self-balancing robots, and vibration monitors.',
    interfaceType: 'I2C / Digital (1 port)',
    dimensionsMm: '19.5 × 19.5 × 8.8 mm',
    chipset: 'MPU6050 / LSM6DS3 6-DoF IMU',
    events: [
      { name: 'orientation', payload: '{"event":"orientation","pitch":12.4,"roll":-4.1,"accel_g":1.02}', description: 'Tilt angles in degrees and net acceleration' },
      { name: 'shake_detected', payload: '{"event":"shake_detected","intensity":2.8}', description: 'Triggered when rapid shake exceeds threshold' },
    ],
    actions: [{ name: 'calibrate_imu', payload: '{"action":"calibrate_imu"}', description: 'Zeroes resting pitch/roll offsets' }],
  },
  {
    slug: 'temp-sensor',
    catalogId: 'dht11_temp_humidity',
    name: 'Temperature Sensor',
    category: 'sensor',
    portsOccupied: 1,
    priceUsd: 12,
    shortDesc: 'Calibrated ambient temperature (°C) and relative humidity (%RH) environmental sensor.',
    fullDesc:
      'Provides accurate climate telemetry for weather stations, server racks, terrariums, and HVAC automation.',
    interfaceType: 'Digital 1-Wire / I2C (1 port)',
    dimensionsMm: '19.5 × 19.5 × 10.5 mm',
    chipset: 'SHT31 / Digital Thermo-Hygrometer',
    events: [{ name: 'temp_humidity', payload: '{"event":"temp_humidity","port":5,"temp_c":22.6,"humidity_pct":46.0}', description: 'Temperature in Celsius and relative humidity %' }],
    actions: [{ name: 'read_climate', payload: '{"action":"read_climate","port":5}', description: 'Requests immediate temperature & humidity sample' }],
  },
  {
    slug: 'usb-c',
    catalogId: 'usb_c_port',
    name: 'USB-C Module',
    category: 'power',
    portsOccupied: 1,
    priceUsd: 10,
    shortDesc: 'High-speed USB-C serial bridge (115200 baud) and 5V/3A power delivery pass-through.',
    fullDesc:
      'Provides auxiliary USB-C connectivity, WebSerial firmware flashing, and regulated 5V rail power for high-draw actuator setups.',
    interfaceType: 'USB 2.0 Full-Speed + 5V PD',
    dimensionsMm: '19.5 × 19.5 × 9.0 mm',
    chipset: 'USB-C Receptacle + ESD Array',
    events: [{ name: 'usb_power', payload: '{"event":"usb_power","vbus_mv":5080}', description: 'Reports USB VBUS voltage' }],
    actions: [],
  },
  {
    slug: 'co2-sensor',
    catalogId: 'co2_sensor',
    name: 'CO2 Sensor',
    category: 'sensor',
    portsOccupied: 1,
    priceUsd: 29,
    shortDesc: 'Indoor air quality sensor measuring CO2 equivalents (ppm) and Total VOCs (ppb).',
    fullDesc:
      'Essential for classroom, office, and bedroom air quality monitors. Alerts when CO2 climbs above 1000 ppm so you know when to open a window.',
    interfaceType: 'Digital I2C (1 port)',
    dimensionsMm: '19.5 × 19.5 × 11.0 mm',
    chipset: 'SCD40 / ENS160 Gas Sensor',
    events: [{ name: 'co2_ppm', payload: '{"event":"co2_ppm","port":1,"ppm":640,"tvoc_ppb":115}', description: 'CO2 concentration in parts per million' }],
    actions: [{ name: 'set_baseline_co2', payload: '{"action":"set_baseline_co2","ppm":400}', description: 'Calibrates fresh-air baseline' }],
  },
  {
    slug: 'micro-sd',
    catalogId: 'micro_sd',
    name: 'MicroSD Card',
    category: 'storage',
    portsOccupied: 1,
    priceUsd: 14,
    shortDesc: 'Removable FAT32/exFAT MicroSD slot for offline sensor logging, WAV audio, and sprites.',
    fullDesc:
      'Log millions of timestamped CSV/JSON sensor rows or stream WAV audio files and bitmap assets directly from a standard MicroSD card.',
    interfaceType: 'SPI Storage (1 port)',
    dimensionsMm: '19.5 × 19.5 × 8.5 mm',
    chipset: 'Push-Push MicroSD Socket + Level Shifter',
    events: [{ name: 'sd_status', payload: '{"event":"sd_status","mounted":true,"free_mb":14820}', description: 'Reports card mount state and capacity' }],
    actions: [{ name: 'append_log', payload: '{"action":"append_log","file":"data.csv","line":"171000,22.4,615"}', description: 'Appends a line to a file on SD' }],
  },
  {
    slug: 'big-screen',
    catalogId: 'big_screen',
    name: 'Big Screen',
    category: 'display',
    portsOccupied: 2,
    priceUsd: 34,
    shortDesc: '2.8-inch 320×240 IPS TFT display for rich multi-chart dashboards and arcade cabinets.',
    fullDesc:
      'Doubles the viewing area with wide 178° viewing angles and fast SPI DMA refresh for complex instrumentation and gaming.',
    interfaceType: 'High-Speed SPI (2 ports)',
    dimensionsMm: '58.0 × 39.5 × 11.5 mm',
    chipset: 'ILI9341 320×240 IPS Controller',
    events: [{ name: 'display_ready', payload: '{"event":"display_ready","width":320,"height":240}', description: 'Emitted when display initializes' }],
    actions: [{ name: 'display_dashboard', payload: '{"action":"display_dashboard","title":"Lab Monitor","metrics":{"CO2":"612 ppm","Temp":"22.1 C"}}', description: 'Renders multi-metric telemetry grid' }],
  },
  {
    slug: 'camera',
    catalogId: 'camera_module',
    name: 'Camera',
    category: 'sensor',
    portsOccupied: 2,
    priceUsd: 28,
    shortDesc: '2MP OV2640 camera module for timelapse, QR decoding, and edge AI vision triggers.',
    fullDesc:
      'Captures JPEG frames into ESP32-S3 PSRAM for WiFi WebSocket streaming, motion detection, or cloud vision classification.',
    interfaceType: 'High-Speed Camera Bus (2 ports)',
    dimensionsMm: '39.5 × 39.5 × 15.0 mm',
    chipset: 'OV2640 1600×1200 CMOS Sensor',
    events: [{ name: 'frame_captured', payload: '{"event":"frame_captured","bytes":18420,"width":320,"height":240}', description: 'JPEG frame captured and ready' }],
    actions: [{ name: 'capture_frame', payload: '{"action":"capture_frame","resolution":"QVGA"}', description: 'Triggers single frame capture' }],
  },
  {
    slug: 'power-jack',
    catalogId: 'power_jack',
    name: 'Power Jack',
    category: 'power',
    portsOccupied: 1,
    priceUsd: 11,
    shortDesc: 'DC barrel jack + buck converter accepting 7V–24V input for high-torque motors and servos.',
    fullDesc:
      'Supplies continuous high current for multi-motor rovers, robot arms, and permanent wall-powered installations.',
    interfaceType: 'DC 5.5×2.1mm (7–24V In -> 5V/3A Out)',
    dimensionsMm: '19.5 × 19.5 × 13.0 mm',
    chipset: 'TPS54331 Synchronous Buck Converter',
    events: [{ name: 'supply_voltage', payload: '{"event":"supply_voltage","vin_mv":12040}', description: 'Reports external DC input voltage' }],
    actions: [],
  },
  {
    slug: 'load-cell',
    catalogId: 'load_cell',
    name: 'Load Cell',
    category: 'sensor',
    portsOccupied: 1,
    priceUsd: 22,
    shortDesc: '24-bit HX711 precision weight and force sensor (0 g – 5000 g with 0.1 g resolution).',
    fullDesc:
      'Build smart coffee scales, filament spool counters, inventory bins, and force-feedback mechanisms with one-click tare calibration.',
    interfaceType: 'Digital 2-Wire HX711 (1 port)',
    dimensionsMm: '19.5 × 39.5 × 12.0 mm',
    chipset: 'HX711 24-Bit Delta-Sigma ADC + Strain Gauge',
    events: [{ name: 'weight_grams', payload: '{"event":"weight_grams","port":5,"grams":248.5}', description: 'Calibrated net weight in grams' }],
    actions: [{ name: 'tare_scale', payload: '{"action":"tare_scale","port":5}', description: 'Zeroes current load as tare offset' }],
  },
  {
    slug: 'frame-2',
    catalogId: 'frame_2',
    name: 'Frame 2.0',
    category: 'enclosure',
    portsOccupied: 0,
    priceUsd: 18,
    shortDesc: 'Snap-fit matte anodized bumper and kickoff stand for the 14-Port Motherboard.',
    fullDesc:
      'Protects the underside PCB, elevates the board at an ergonomic 15° desk angle, and provides M3 mounting bosses for LEGO Technic and 3D-printed brackets.',
    interfaceType: 'Mechanical Snap-Fit Chassis',
    dimensionsMm: '84.0 × 124.0 × 18.0 mm',
    chipset: 'CNC Polycarbonate + Silicone Feet',
    events: [],
    actions: [],
  },
];

export interface BuiltShowcaseItem {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  heroStat: string;
  prompt: string;
  summary: string;
  modulesUsed: string[];
  howItWorks: string[];
}

export const BUILT_WITH_KIT_SHOWCASES: BuiltShowcaseItem[] = [
  {
    slug: 'co2',
    title: 'Desktop CO2 & Focus Monitor',
    subtitle: 'Breathes calm green below 800 ppm, warns amber at 1000 ppm, and chimes when you need fresh air.',
    category: 'Smart Home & Office',
    readTime: '3 min build',
    heroStat: '4 modules · 0 wires',
    prompt:
      'Build a desktop CO2 and temperature monitor with a Color Display on ports 3-4, a CO2 sensor on port 1, a Temperature sensor on port 2, a 3x3 LED Grid on port 9, and a Button on port 7 to toggle night mode.',
    summary:
      'High indoor CO2 quietly degrades cognitive performance in meeting rooms and home offices. This build snaps four modules onto the 14-port motherboard to track CO2 (ppm), temperature (°C), and humidity (%RH) with a live sparkline and ambient LED status bar.',
    modulesUsed: ['motherboard-14port', 'co2-sensor', 'temp-sensor', 'screen', 'led-grid', 'button'],
    howItWorks: [
      'Snap the CO2 Sensor into Port 1, Temperature Sensor into Port 2, Color Screen into Ports 3–4, Button into Port 7, and LED Grid into Port 9.',
      'Open Atech Studio, paste the prompt, and flash the generated firmware over USB-C in one click.',
      'The 3×3 LED Grid shifts smoothly from emerald (<800 ppm) to amber (800–1200 ppm) to pulsing coral (>1200 ppm), while pressing the Button mutes the LEDs for sleep mode.',
    ],
  },
  {
    slug: 'soil',
    title: 'Autonomous Plant & Soil Guardian',
    subtitle: 'Tracks root moisture, ambient humidity, and waters your basil automatically when dry.',
    category: 'Smart Home',
    readTime: '4 min build',
    heroStat: '5 modules · 0 soldering',
    prompt:
      'Build a smart plant monitor using a Soil Sensor on port 1, Temperature/Humidity sensor on port 2, Color Display on ports 3-4, LED Grid on port 9, and a DC Motor pump on port 6 that runs for 3 seconds when moisture drops below 30%.',
    summary:
      'Never overwater or underwater houseplants again. The capacitive Soil Sensor reads root moisture continuously while the Color Screen shows a happy/thirsty plant face and triggers a peristaltic pump via the DC Motor module.',
    modulesUsed: ['motherboard-14port', 'soil-sensor', 'temp-sensor', 'screen', 'led-grid', 'dc-motor'],
    howItWorks: [
      'Insert the Soil Sensor probe into the pot and connect it to Port 1 (ADC enabled).',
      'The firmware averages moisture readings every 10 seconds and displays a live bar chart on the IPS screen.',
      'When moisture stays below 30% for 5 minutes, Port 6 drives the DC peristaltic pump for 3 seconds and logs the watering event over WiFi.',
    ],
  },
  {
    slug: 'tamagotchi',
    title: 'Pocket AI Tamagotchi Pet',
    subtitle: 'A living pixel companion that reacts to sound, motion shakes, rotary knob feeding, and room temperature.',
    category: 'Games & Gadgets',
    readTime: '3 min build',
    heroStat: '6 modules · Playable in 3D',
    prompt:
      'Build a virtual Tamagotchi pet with a Color Screen on ports 3-4, Knob on port 5 to cycle actions (Feed, Play, Sleep), Button on port 1 to select, Speaker on ports 9-10 for happy/hungry chirps, and Orientation Sensor on port 6 so shaking the board plays with the pet.',
    summary:
      'Unlike a phone app, a hardware Tamagotchi lives in the physical world: it shivers when your room gets cold, wakes up when you speak near it, and jumps for joy when you physically shake the board.',
    modulesUsed: ['motherboard-10port', 'screen', 'knob', 'button', 'speaker', 'orientation-sensor'],
    howItWorks: [
      'Turn the Rotary Knob to highlight Feed, Play, Clean, or Stats on the 240×240 IPS display and press the Button to confirm.',
      'The 6-Axis Orientation Sensor detects gentle shakes to boost the pet happiness meter.',
      'The I2S Speaker synthesizes expressive 8-bit chiptune arpeggios for every mood transition.',
    ],
  },
  {
    slug: 'car',
    title: 'Obstacle-Avoiding WiFi Rover',
    subtitle: 'Dual DC gearmotors, laser Time-of-Flight rangefinder, and browser joystick telemetry.',
    category: 'Robotics',
    readTime: '5 min build',
    heroStat: '6 modules · WiFi live control',
    prompt:
      'Build a 2WD rover with left DC Motor on port 1, right DC Motor on port 2, Distance Sensor on port 7 facing forward, LED Grid headlights on ports 9 and 13, and WiFi gateway control for forward, reverse, spin_left, spin_right, and auto_roam.',
    summary:
      'Snap two DC Motor modules and a forward-facing Distance Sensor onto the motherboard to create an autonomous rover that maps clearance distances and accepts live WebSocket drive commands from Atech Studio.',
    modulesUsed: ['motherboard-14port', 'dc-motor', 'distance-sensor', 'led-grid', 'orientation-sensor', 'power-jack'],
    howItWorks: [
      'Ports 1 and 2 drive the left and right N20 gearmotors independently for zero-radius tank turns.',
      'Port 7 (top center) houses the Distance Sensor, scanning ahead at 20 Hz and automatically braking or pivoting when an obstacle is closer than 150 mm.',
      'Use the Studio WiFi card to send live JSON actions (`{"action":"drive","left":80,"right":80}`) from your laptop or phone.',
    ],
  },
  {
    slug: 'drums',
    title: 'Euclidean Synth & Pocket Drum Machine',
    subtitle: 'Step-sequenced polyrhythms with rotary BPM control, distance-sensor filter sweep, and RGB step grid.',
    category: 'Audio & Music',
    readTime: '4 min build',
    heroStat: '5 modules · I2S Digital Synth',
    prompt:
      'Build a pocket drum machine and synth with Speaker on ports 9-10, two 3x3 LED Grids on ports 1 and 2 as an 18-step sequencer display, Knob on port 5 for BPM (60-180), Distance Sensor on port 6 for hand-controlled pitch/filter modulation, and Button on port 7 for play/tap-tempo.',
    summary:
      'Wave your hand above the Distance Sensor like a theremin to bend pitch and resonance while the 3×3 RGB LED Grids chase through Euclidean drum patterns in real time.',
    modulesUsed: ['motherboard-14port', 'speaker', 'led-grid', 'knob', 'distance-sensor', 'button'],
    howItWorks: [
      'The Rotary Knob adjusts tempo from 60 to 180 BPM with instant visual feedback on the Color Screen.',
      'Hand height between 50 mm and 300 mm over the Distance Sensor modulates synthesizer note frequency in real time.',
      'The I2S Speaker mixes kick, snare, hi-hat, and bass voices at 44.1 kHz.',
    ],
  },
  {
    slug: 'clawd',
    title: 'Clawd — Desktop Robotic Arm Assistant',
    subtitle: '3-DOF servo arm that sorts objects, waves on Slack notifications, and tracks rotary knob choreography.',
    category: 'Robotics',
    readTime: '5 min build',
    heroStat: '5 modules · 3-DOF Kinematics',
    prompt:
      'Build Clawd: a desktop robot arm controller with Robot Arm on ports 1-2, Knob on port 5 for manual joint jogging, Button on port 7 to record/replay waypoints, Color Display on ports 3-4, and LED Grid on port 9.',
    summary:
      'Record multi-point pick-and-place trajectories by turning the Knob and clicking the Button to save waypoints, then replay them smoothly with cosine-eased servo interpolation.',
    modulesUsed: ['motherboard-14port', 'robot-arm', 'knob', 'button', 'screen', 'led-grid'],
    howItWorks: [
      'Press the Button briefly to cycle between Base (J1), Shoulder (J2), and Gripper (J3) axes; turn the Knob to position the arm.',
      'Hold the Button for 500 ms to store the current pose into the waypoint sequence.',
      'Trigger poses remotely over the Studio WiFi gateway (`{"action":"set_joint_angles","j1":120,"j2":60,"j3":90}`).',
    ],
  },
  {
    slug: 'lapper',
    title: 'Precision RC Lap Timer & Gate',
    subtitle: 'Sub-millisecond laser beam-break lap counter with split times, best-lap chime, and OLED leaderboard.',
    category: 'Sports & Racing',
    readTime: '3 min build',
    heroStat: '4 modules · 1 ms precision',
    prompt:
      'Build a race lap timer using a Distance Sensor on port 6 as a beam-break gate, Color Screen on ports 3-4 showing current lap, last 5 splits, and best lap, Speaker on ports 9-10 for lap/record chimes, and Button on port 1 to reset session.',
    summary:
      'Place the board beside a mini-RC track or Pinewood Derby lane. Every time a car crosses the Distance Sensor beam (<120 mm), it logs the exact millisecond split, flashes the LED Grid green on a personal best, and announces the lap time.',
    modulesUsed: ['motherboard-10port', 'distance-sensor', 'screen', 'speaker', 'led-grid', 'button'],
    howItWorks: [
      'Samples the Distance Sensor at high rate with a 500 ms cooldown lock-out to prevent double-counting wheels.',
      'Displays live running tenths-of-a-second, lap count, and delta against the session fastest lap.',
      'Streams every completed lap event as JSON (`{"event":"lap_completed","lap":4,"ms":4821}`) to your laptop.',
    ],
  },
];

export const CODING_AGENT_SYSTEM_PROMPT = `You are an expert embedded hardware & firmware engineer building for the Atech modular electronics platform (ESP32-S3 14-Port and 10-Port motherboards).

HARDWARE ARCHITECTURE:
- 14-Port Motherboard ("14port_board"):
  - Left column (top to bottom): port_1, port_2, port_3, port_4, port_5, port_6
  - Top center: port_7 (1-port slot)
  - Bottom center: port_8 (Reserved: USB-C 115200 baud serial & power)
  - Right column (top to bottom): port_9, port_10, port_11, port_12 (Reserved: Reset), port_13, port_14
- Double-width (2-port) modules ("screen", "speaker", "microphone", "robot-arm", "big-screen", "camera") MUST occupy legal adjacent pairs:
  [port_1,port_2], [port_2,port_3], [port_3,port_4], [port_4,port_5], [port_5,port_6], [port_9,port_10], [port_10,port_11], [port_13,port_14].
- Analog sensors ("soil-sensor") MUST be placed on ADC-capable ports (port_1 through port_7).

JSON SERIAL WIRE PROTOCOL (115200 BAUD, newline-delimited JSON):
- Emit device events as single-line JSON objects:
  {"event":"button_pressed","port":7}
  {"event":"knob_turned","port":5,"delta":1,"position":12}
  {"event":"distance_mm","port":6,"value":180}
- Accept host actions on Serial / WiFi WebSocket gateway:
  {"action":"display_text","title":"Status","body":"Ready"}
  {"action":"fill_grid","port":9,"r":16,"g":185,"b":129}
  {"action":"play_note","frequency":440,"duration_ms":200}
`;

export interface KitDefinition extends KitItem {
  priceEur: number;
  modules: { slug: string; name: string; qty: number; ports: number }[];
}

export const HARDWARE_KITS: KitDefinition[] = STORE_KITS.map((k) => ({
  ...k,
  priceEur: k.slug === 'small-kit' ? 50 : k.slug === 'big-kit' ? 100 : 200,
  modules: k.includedModules,
}));

export interface EnrichedStoreModule extends StoreModuleSpec {
  priceEur: number;
  tagline: string;
  description: string;
  pins: string;
  footprint: string;
  includedIn: { kit: string; qty: number }[];
  specs: string[];
}

export const ENRICHED_STORE_MODULES: EnrichedStoreModule[] = STORE_MODULES.map((m) => {
  const includedIn: { kit: string; qty: number }[] = [];
  for (const k of STORE_KITS) {
    const found = k.includedModules.find((inc) => inc.slug === m.slug);
    if (found) {
      includedIn.push({ kit: k.name, qty: found.qty });
    }
  }
  return {
    ...m,
    priceEur: m.priceUsd,
    tagline: m.shortDesc,
    description: m.fullDesc,
    pins: m.interfaceType,
    footprint: m.dimensionsMm,
    includedIn,
    specs: [
      `Chipset: ${m.chipset}`,
      `Interface: ${m.interfaceType}`,
      `Footprint: ${m.dimensionsMm}`,
      `Ports occupied: ${m.portsOccupied || 1}`,
    ],
  };
});

export interface ShowcaseDetailItem {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  prompt: string;
  modules: { slug: string; name: string; qty: number }[];
}

export const SHOWCASE_DETAILS: ShowcaseDetailItem[] = [
  ...BUILT_WITH_KIT_SHOWCASES.map((s) => ({
    slug: s.slug,
    title: s.title,
    tagline: s.subtitle,
    description: s.summary,
    prompt: s.prompt,
    modules: s.modulesUsed.map((slug) => {
      const mod = STORE_MODULES.find((m) => m.slug === slug);
      return {
        slug,
        name: mod ? mod.name : slug,
        qty: 1,
      };
    }),
  })),
  {
    slug: 'game-console',
    title: 'Pocket Game Console',
    tagline: 'Handheld 128×64 OLED arcade with joystick, tactile buttons, and piezo audio.',
    description:
      'Snap an OLED display, thumb joystick, two push buttons, and a piezo speaker onto the motherboard to play Snake, Pong, and Space Invaders.',
    prompt:
      'Build a handheld retro game console with OLED display, joystick, two action buttons, and buzzer sound effects.',
    modules: [
      { slug: 'screen', name: 'Screen', qty: 1 },
      { slug: 'knob', name: 'Knob', qty: 1 },
      { slug: 'button', name: 'Button', qty: 2 },
      { slug: 'speaker', name: 'Speaker', qty: 1 },
    ],
  },
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Do I need any soldering or breadboard wiring?',
    a: 'Zero soldering or wiring is required. Every Atech module snaps magnetically onto any of the 14 ports on the ESP32-S3 motherboard with automatic reverse-polarity protection.',
  },
  {
    q: 'How does the AI Firmware Studio program the hardware?',
    a: 'Describe what you want your device to do in plain English. Studio selects the required modules, maps the 14 motherboard slots, synthesizes clean non-blocking ESP32-S3 C++ code, and flashes it over USB-C via WebSerial.',
  },
  {
    q: 'Can I write or edit the C++ / Arduino code myself?',
    a: 'Yes! Switch any Studio project to the Firmware tab or Advanced mode to inspect, edit, copy, or download the full .ino C++ source file.',
  },
  {
    q: 'What is the difference between the Small Kit, Big Kit, and Chunky Kit?',
    a: 'Small Kit (€50) includes 10 core modules for games and smart gadgets. Big Kit (€100, Most Popular) includes the 14-port motherboard and 20 modules including audio, CO2, and motors. Chunky Kit (€200) includes 3 motherboards and 30 modules including the 3-DOF Robot Arm, Camera, and Load Cell.',
  },
  {
    q: 'Does the motherboard support Wi-Fi, Bluetooth, and webhooks?',
    a: 'Yes. Every motherboard is powered by an ESP32-S3 with 2.4 GHz Wi-Fi and Bluetooth 5.0 LE, supporting inbound JSON commands and outbound HTTP webhooks.',
  },
  {
    q: 'How do I get an invitation code for Atech Studio?',
    a: 'Every hardware kit ships with an invitation code, or an administrator can mint single-use or expiring cohort invitation codes from the Admin Dashboard.',
  },
];

import rawShowcases from './showcases.json';
import rawCatalog from './catalog.json';

export interface StudioShowcaseNormalized {
  id: string;
  label: string;
  tagline: string;
  description: string;
  prompt: string;
  placements: Array<{
    instance_id: string;
    part_id: string;
    slot: string;
    rotation_deg?: number;
  }>;
}

export const STUDIO_SHOWCASES: StudioShowcaseNormalized[] = (
  rawShowcases.items || []
).map((item) => ({
  id: item.slug,
  label: item.name,
  tagline: `${item.assignments.length} modules on 14-Port Motherboard`,
  description: `Interactive ${item.name} built with ${item.assignments
    .map((a) => a.name)
    .join(', ')}.`,
  prompt: item.prompt,
  placements: item.assignments.map((a, idx) => ({
    instance_id: a.instance || `${a.module_id}_${idx + 1}`,
    part_id: a.module_id,
    slot: `S${(a.ports?.[0] || 'port_1').replace('port_', '')}`,
    rotation_deg: 0,
  })),
}));

export interface CatalogPartNormalized {
  id: string;
  name: string;
  fullName: string;
  tier: 'atech' | 'board' | 'ky';
  tierBadge: string;
  category: string;
  description: string;
  subline: string;
  priceDisplay: string | null;
  portsUsed: number;
  recommended: boolean;
  interfaceType: string;
  currentMa: number | null;
  sizeMm: string;
  driver: string | null;
  capabilities: { id: string; description: string }[];
  howItWorks: string;
  kyCode?: string;
  pins?: string[];
}

export const FULL_CATALOG_63_PARTS: CatalogPartNormalized[] = [
  ...(rawCatalog.modules || []).map((m) => ({
    id: m.id,
    name: m.display_name || m.name,
    fullName: m.name,
    tier: 'atech' as const,
    tierBadge: `ATECH · ${(m.category || 'MODULE').toUpperCase()}`,
    category: m.category || 'sensor',
    description: m.description || m.use_for || '',
    subline: `${m.interface?.type || 'digital'} · ${m.current_ma || 15} mA`,
    priceDisplay: m.price?.display || '$15.00',
    portsUsed: m.ports_used || m.size || 1,
    recommended: Boolean(m.recommended),
    interfaceType: m.interface?.type || 'digital',
    currentMa: m.current_ma || 15,
    sizeMm: m.dimensions_mm
      ? `${m.dimensions_mm.x} × ${m.dimensions_mm.y} × ${m.dimensions_mm.z} mm`
      : '19.5 × 9.6 × 19.5 mm',
    driver: m.driver || null,
    capabilities: (m.capability_detail || []).map((c: { id: string; description: string }) => ({
      id: c.id,
      description: c.description,
    })),
    howItWorks: m.how_it_works || m.description || '',
  })),
  ...((rawCatalog as unknown as { offtheshelf_boards?: Array<Record<string, unknown>> }).offtheshelf_boards || []).map((b) => ({
    id: String(b.id),
    name: String(b.name),
    fullName: `${b.name} (${b.mcu || b.kind})`,
    tier: 'board' as const,
    tierBadge: `BOARD · ${String(b.kind || 'MCU').toUpperCase()}`,
    category: 'boards',
    description: String(b.notes || `${b.vendor} ${b.name} with ${b.mcu}`),
    subline: `${b.logic_v || 3.3}V logic · ${b.gpio || 20} GPIO`,
    priceDisplay: null,
    portsUsed: 0,
    recommended: false,
    interfaceType: `${b.logic_v || 3.3}V GPIO`,
    currentMa: null,
    sizeMm: 'Standard Dev Board Footprint',
    driver: String(b.mcu || 'MCU'),
    capabilities: ((b.connectivity as string[]) || ['gpio']).map((c) => ({
      id: c,
      description: `Built-in ${c.toUpperCase()} interface support`,
    })),
    howItWorks: String(b.notes || ''),
  })),
  ...((rawCatalog as unknown as { ky_modules?: Array<Record<string, unknown>> }).ky_modules || []).map((k) => {
    const dims = k.dimensions_mm as { x?: number; y?: number; z?: number } | undefined;
    return {
      id: String(k.id),
      name: String(k.name),
      fullName: `${k.ky} — ${k.name}`,
      tier: 'ky' as const,
      tierBadge: `${k.ky || 'KIT'} · ${String(k.category || 'SENSOR').toUpperCase()}`,
      category: String(k.category || 'sensor'),
      description: String(k.notes || `${k.ky} ${k.name} (${k.interface} interface)`),
      subline: `${k.interface || 'digital'} · ${k.gpios_needed || 1} GPIO`,
      priceDisplay: null,
      portsUsed: 1,
      recommended: false,
      interfaceType: String(k.interface || 'digital'),
      currentMa: 10,
      sizeMm: dims ? `${dims.x} × ${dims.y} × ${dims.z} mm` : '19.0 × 15.0 × 10.0 mm',
      driver: String(k.ky || 'KY_Sensor'),
      capabilities: ((k.capabilities as string[]) || []).map((c) => ({
        id: c,
        description: `Provides ${c.replace(/_/g, ' ')} capability via ${k.interface} pin`,
      })),
      howItWorks: String(k.notes || ''),
      kyCode: String(k.ky || ''),
      pins: (k.pins as string[]) || ['S', 'VCC', 'GND'],
    };
  }),
];

export const CATALOG_PARTS: CatalogPartNormalized[] = FULL_CATALOG_63_PARTS;

export interface BuilderQuote {
  id: string;
  quote: string;
  author: string;
  role: string;
  channel: string;
  avatarInitials: string;
}

export const BUILDER_QUOTES: BuilderQuote[] = [
  {
    id: 'q-tim',
    quote: 'As a dad, I’m really excited to see what your future projects bring so I can get my kids building real gadgets.',
    author: 'Tim Hopkins',
    role: 'Early kit customer, Handwritten note',
    channel: 'Note',
    avatarInitials: 'TH',
  },
  {
    id: 'q-christian',
    quote: 'Think of something. Describe it. Build it. Hold it. That’s the loop. And it works.',
    author: 'Christian Berndt',
    role: 'Hardware prototyper',
    channel: 'LinkedIn',
    avatarInitials: 'CB',
  },
  {
    id: 'q-erik',
    quote: 'Can we make a rocket with the Atech stack? It seems like we can.',
    author: 'Erik Alexander Eklöf',
    role: 'First video with the kit',
    channel: 'YouTube',
    avatarInitials: 'EE',
  },
  {
    id: 'q-joakim',
    quote: 'Made my Atech kit a full SID-player hardware! It is a really nice hardware/software prototyping kit!',
    author: 'Joakim Eriksson',
    role: 'SID player from his kit',
    channel: 'X',
    avatarInitials: 'JE',
  },
  {
    id: 'q-oliver',
    quote: 'Built a small thing with the help of the AI and it worked out of the box, AI and electronics feel like magic. I am surprised how cool and easy accessible this is, brilliant!',
    author: 'Oliver Brupbacher',
    role: 'Early kit customer, Switzerland',
    channel: 'Email',
    avatarInitials: 'OB',
  },
  {
    id: 'q-martin',
    quote: 'These Atech guys are absolutely insane … Vibe engineering will become the next vibe coding, and it feels inevitable these guys will be the ones in the forefront.',
    author: 'Martin Blomberg',
    role: 'CEO & Co-founder, Root Bio',
    channel: 'LinkedIn',
    avatarInitials: 'MB',
  },
];

export interface CoverflowSetup {
  id: string;
  title: string;
  caption: string;
  modules: string[];
  prompt: string;
  showcaseSlug?: string;
}

export const COVERFLOW_SETUPS: CoverflowSetup[] = [
  {
    id: 'arcade',
    title: 'Arcade',
    caption: 'A knob, a button and a screen — the pocket console.',
    modules: ['Color Display', 'Knob', 'Button', 'Speaker'],
    prompt: 'Build a pocket arcade console with a Color Display on ports 3-4, a Knob on port 5 for paddle control, a Button on port 7 to launch/fire, and a Speaker on ports 9-10.',
    showcaseSlug: 'tamagotchi',
  },
  {
    id: 'clawd',
    title: 'Clawd',
    caption: 'The desktop companion, on your desk.',
    modules: ['Robot Arm', 'Color Display', 'Knob', 'Button', 'LED Grid'],
    prompt: 'Build Clawd: a desktop robot arm companion with a Color Display, Knob, Button, and 3x3 LED Grid that waves and reacts to you.',
    showcaseSlug: 'clawd',
  },
  {
    id: 'rover',
    title: 'Rover',
    caption: 'Two motors and a distance sensor that steers around walls.',
    modules: ['DC Motor ×2', 'Distance Sensor', 'Orientation Sensor', 'LED Grid'],
    prompt: 'Build a 2WD obstacle-avoiding rover with two DC Motors on ports 1 and 6, Distance Sensor on port 7, and Orientation Sensor on port 5.',
    showcaseSlug: 'car',
  },
  {
    id: 'desk-lamp',
    title: 'Desk lamp',
    caption: 'Turn the knob to dim; press to shift from warm to cool.',
    modules: ['LED Grid ×2', 'Knob', 'Button'],
    prompt: 'Build a smart desk lamp with two 3x3 LED Grids on ports 1 and 2, a Knob on port 5 to smoothly dim brightness, and a Button on port 7 to toggle warm/cool color temperature.',
  },
  {
    id: 'sound-light',
    title: 'Sound light',
    caption: 'Nine LEDs that pulse with whatever is playing in the room.',
    modules: ['Microphone', 'LED Grid ×2', 'Knob'],
    prompt: 'Build a sound-reactive spectrum light using a Microphone on ports 9-10, two 3x3 LED Grids on ports 1 and 2, and a Knob on port 5 to adjust sensitivity.',
    showcaseSlug: 'drums',
  },
  {
    id: 'scale',
    title: 'Scale',
    caption: 'A load cell and a screen — tare with the button, read in grams.',
    modules: ['Load Cell', 'Color Display', 'Button'],
    prompt: 'Build a precision digital coffee scale with a Color Display on ports 3-4, Load Cell on port 5, and Button on port 7 for zero/tare.',
  },
  {
    id: 'plant-monitor',
    title: 'Plant monitor',
    caption: 'Reads the soil and tells you when the pot has gone dry.',
    modules: ['Soil Sensor', 'Temperature & Humidity', 'Color Display', 'LED Grid'],
    prompt: 'Build a smart plant monitor with Soil Sensor on port 1, Temperature & Humidity sensor on port 2, Color Display on ports 3-4, and LED Grid on port 9.',
    showcaseSlug: 'soil',
  },
];

export interface ArenaScenario {
  id: 'car' | 'tumbler' | 'weather';
  num: string;
  name: string;
  title: string;
  subtitle: string;
  modulesTested: { name: string; port: string; role: string }[];
  controls: { key: string; label: string }[];
  prompt: string;
}

export const ARENA_SCENARIOS: ArenaScenario[] = [
  {
    id: 'car',
    num: '01',
    name: 'Atech Car',
    title: 'Drive the 14-Port Rover in a physics arena',
    subtitle: 'Tests DC Motors (Ports 1, 6, 9, 14), Distance Sensor, Orientation IMU, Temperature & Humidity, and Color Display.',
    modulesTested: [
      { name: 'DC Motor (Left)', port: 'Port 1 & 6', role: 'Left drive channel (-100% to +100%)' },
      { name: 'DC Motor (Right)', port: 'Port 9 & 14', role: 'Right drive channel (-100% to +100%)' },
      { name: 'Temperature & Humidity', port: 'Port 2', role: 'Real-time surface & air climate telemetry' },
      { name: 'Color Display', port: 'Port 3–4', role: 'On-board speedometer & autonomous HUD' },
      { name: 'Orientation Sensor', port: 'Port 5', role: 'Pitch, roll, yaw & collision G-force' },
      { name: 'Distance Sensor', port: 'Port 7', role: 'Forward laser obstacle rangefinder' },
    ],
    controls: [
      { key: 'WASD', label: 'drive' },
      { key: 'Shift', label: 'boost' },
      { key: 'Space', label: 'brake' },
      { key: 'R', label: 'flip back' },
      { key: 'P', label: 'autonomous mode' },
      { key: '1-4', label: 'worlds' },
      { key: 'Q G V B X', label: 'tools' },
    ],
    prompt:
      'Build the Arena Atech Car with DC Motors on ports 1, 6, 9, and 14, Temperature & Humidity on port 2, Color Display on ports 3-4, Orientation Sensor on port 5, and Distance Sensor on port 7 with autonomous obstacle avoidance.',
  },
  {
    id: 'tumbler',
    num: '02',
    name: 'Tumbler',
    title: 'Toss, spin, and drop the board to test 6-axis IMU & G-force',
    subtitle: 'Tests Orientation Sensor, Accelerometer, Gyroscope, 3×3 Light Grid, and Color Display impact telemetry.',
    modulesTested: [
      { name: 'Orientation Sensor', port: 'Port 5', role: '3D Euler angles (Pitch, Roll, Yaw) & free-fall detection' },
      { name: 'Light Grid', port: 'Port 1', role: 'G-force shock & spin velocity visualizer' },
      { name: 'Color Display', port: 'Port 3–4', role: 'Live air-time, peak G, and RPM records' },
    ],
    controls: [
      { key: 'Space', label: 'toss' },
      { key: 'D', label: 'drop from 1m' },
      { key: 'S', label: 'spin' },
      { key: 'F', label: 'flip' },
      { key: 'K', label: 'shake' },
      { key: 'Drag', label: 'throw' },
    ],
    prompt:
      'Build the Arena Tumbler stunt logger with Orientation Sensor on port 5, 3x3 LED Grid on port 1, and Color Display on ports 3-4 tracking peak G-force, air time (ms), and spin rate (°/s).',
  },
  {
    id: 'weather',
    num: '03',
    name: 'Weather Station',
    title: 'Subject the board to 6 extreme climates, mist, and heat',
    subtitle: 'Tests Temperature & Humidity Sensor, 3×3 Light Grid comfort bar, and Color Display psychrometric chart.',
    modulesTested: [
      { name: 'Temperature & Humidity', port: 'Port 2', role: 'High-rate °C, %RH, and dew-point sensing' },
      { name: 'Light Grid', port: 'Port 1', role: 'Thermal color gradient (Ice Blue -> Emerald -> Amber -> Red)' },
      { name: 'Color Display', port: 'Port 3–4', role: 'Live temperature, humidity & comfort index' },
    ],
    controls: [
      { key: '1-6', label: 'environments' },
      { key: 'Space', label: 'spray water' },
      { key: 'B', label: 'breathe on it' },
      { key: 'H', label: 'hair dryer' },
    ],
    prompt:
      'Build the Arena Weather Station with Temperature & Humidity sensor on port 2, 3x3 LED Grid on port 1, and Color Display on ports 3-4 with dew-point calculation and climate alerts.',
  },
];

export const EDITOR_PROMPTS: { label: string; prompt: string; modules: string[] }[] = [
  {
    label: 'Bedroom CO₂ monitor',
    prompt: 'Build a bedroom CO2 and temperature monitor that glows soft green when air is fresh and pulses amber when CO2 exceeds 1000 ppm, with a button to mute the light at night.',
    modules: ['CO2 Sensor', 'Temperature & Humidity', 'Color Display', 'LED Grid', 'Button'],
  },
  {
    label: 'Reaction game',
    prompt: 'Build a 2-player reflex reaction game where the 3x3 LED Grid flashes after a random countdown, the first button press wins, and the Color Display tracks millisecond reaction times.',
    modules: ['Color Display', 'LED Grid', 'Button', 'Speaker'],
  },
  {
    label: 'Drum machine',
    prompt: 'Build a pocket Euclidean drum machine with a Speaker, two 3x3 LED Grids for the 16-step sequencer, a Knob for BPM tempo, and a Distance Sensor for hand filter sweeps.',
    modules: ['Speaker', 'LED Grid', 'Knob', 'Distance Sensor', 'Button'],
  },
  {
    label: 'Knock-to-unlock safe',
    prompt: 'Build a secret knock-pattern lock using the Microphone and Orientation Sensor to recognize a rhythm of taps and drive a DC Motor latch while showing status on the LED Grid.',
    modules: ['Microphone', 'Orientation Sensor', 'DC Motor', 'LED Grid', 'Button'],
  },
  {
    label: 'Theremin',
    caption: 'Wave your hand over the distance sensor to bend pitch.',
    prompt: 'Build an optical theremin synthesizer where hand height above the Distance Sensor controls pitch on the Speaker and the Rotary Knob selects musical scale and waveform.',
    modules: ['Distance Sensor', 'Speaker', 'Knob', 'LED Grid'],
  } as { label: string; prompt: string; modules: string[] },
  {
    label: 'Air piano',
    prompt: 'Build a touchless air piano that maps distance zones (40mm to 320mm) to pentatonic notes on the I2S Speaker and lights up matching columns on the 3x3 LED Grid.',
    modules: ['Distance Sensor', 'Speaker', 'LED Grid', 'Color Display'],
  },
  {
    label: 'Shortcut keyboard',
    prompt: 'Build a macro shortcut deck with tactile Buttons, a Rotary Knob for system volume/scrubbing, and a Color Display showing the active workspace profile.',
    modules: ['Color Display', 'Knob', 'Button', 'LED Grid'],
  },
];


