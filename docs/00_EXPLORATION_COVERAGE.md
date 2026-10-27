# 00 — Exploration Coverage & Reverse-Engineering Report

## 1. Executive Summary

Using Playwright (Chromium headless + CDP screenshot capture) and authenticated API inspection, we systematically explored both production surfaces of the Atech platform:
1. **`https://atech.dev/`** — The Storefront, Hardware Module Catalog, Built-with-the-Kit Showcases, Documentation, Vertical Landing Pages, Country/Currency Switcher, and Shopping Cart.
2. **`https://studio.atech.dev/`** — The "Prompt to Product" AI Hardware & Firmware Studio, 3D Interactive Board Viewer & Emulator, 63-Part Hardware Catalog (`12 Atech modules`, `14 off-the-shelf MCU/SBC boards`, `37 KY-series sensors/actuators`), Project Editor (`Simple` vs `Advanced` modes, `Electronics`, `Firmware`, `WiFi` cards), Projects Gallery, Community Hub, Account Settings, Support Modal, and Admin Dashboard (`/dashboard.html`).

All 100 high-resolution screenshots (`00_atech_home_1440.png` through `100_studio_follow_along_popover.png`) are archived locally in `/home/azadmin/atech/screenshots/`.

---

## 2. Authentication & Session Reconnaissance

- **Credentials & Cookies (`.cred`)**: Loaded domain cookies (`atech_country=SG`, `atech_cart_count`, PostHog telemetry state) across `.atech.dev` and `studio.atech.dev`.
- **Live Registration & OTP Verification**:
  - Created a real temporary mailbox (`atech_pw_1793080002760@maxxspace.com`) via `api.mail.tm`.
  - Executed `POST https://studio.atech.dev/api/auth/signup` (`200 OK`, `confirmation_required: true`).
  - Polled `api.mail.tm` and extracted the 8-digit confirmation code (`71387598`) sent by `Atech <noreply@studio.atech.dev>`.
  - Verified via `POST https://studio.atech.dev/api/auth/verify-otp`, receiving a live JWT `access_token`, `refresh_token`, and user ID `46f79aaa-2c6d-44e4-848f-edd6a5044f98`.
  - Discovered the exact browser storage keys in `/auth.js`:
    - `p2p_auth_token` (JWT Bearer token)
    - `p2p_auth_user` (`{"id":"...","email":"..."}`)
    - `p2p_auth_refresh` (Refresh token)
    - `p2p_auth_exp` (Unix epoch expiry timestamp)
    - `p2p_anon_projects` (Anonymous project ID list replayed via `POST /api/projects/:id/claim` upon login transition)

---

## 3. Route Coverage Matrix — `https://atech.dev/` (Storefront & Docs)

| # | Route | Title | HTTP | Screenshot(s) | Key Elements & Interactions Verified |
|---|-------|-------|------|---------------|--------------------------------------|
| 1 | `/` | Atech — Build custom electronics with AI | 200 | `00`, `01`, `32`–`37` | Hero video, "Try the AI" CTA, Built with the kit carousel (7 builds), Small/Big/Chunky Kit pricing cards, "Try it in 3D" interactive modal, Kit module breakdown modal, 21 Available Modules grid, Dark mode, Mobile menu |
| 2 | `/learn-more` | Learn More — Atech | 200 | `02` | Platform architecture overview, plug-and-play port system, AI firmware workflow |
| 3 | `/modules` | Modules — Atech | 200 | `03` | Complete grid of 21 Atech hardware modules with port widths (1-port, 2-port, boards) and specs |
| 4 | `/modules/motherboard-14port` | 14-Port Motherboard — Atech | 200 | `04` | ESP32-S3 dual-core 240 MHz, 8 MB PSRAM, 16 MB flash, ports 1–7, 9–11, 13–14, USB-C (port 8), Reset (port 12), LiPo charger |
| 5 | `/modules/motherboard-10port` | 10-Port Motherboard — Atech | 200 | `05` | Compact 10-port ESP32-S3 motherboard specification & pinout |
| 6 | `/modules/robot-arm` | Robot Arm — Atech | 200 | `06` | 3-DOF servo robotic arm module (`set_joint_angles`, `get_joint_angles`) |
| 7 | `/modules/soil-sensor` | Soil Sensor — Atech | 200 | `07` | Capacitive soil moisture sensor (`soil_moisture` 0–100%) |
| 8 | `/modules/knob` | Knob — Atech | 200 | `08` | Quadrature rotary encoder (`knob_turned` delta +1/-1, `position`) |
| 9 | `/modules/screen` | Screen — Atech | 200 | `09` | 1.54" 240×240 IPS TFT display ST7789 (2-port module) |
| 10 | `/modules/speaker` | Speaker — Atech | 200 | `10` | MAX98357A I2S class-D amplifier + speaker (2-port module) |
| 11 | `/modules/microphone` | Microphone — Atech | 200 | `11` | INMP441 I2S digital MEMS microphone (2-port module) |
| 12 | `/modules/dc-motor` | DC Motor — Atech | 200 | `12` | DRV8833 H-bridge bidirectional motor driver (`set_speed` -100 to 100) |
| 13 | `/modules/led-grid` | LED Grid — Atech | 200 | `13` | 3×3 addressable RGB WS2812B LED matrix (`set_pixel`, `fill`, `clear`) |
| 14 | `/modules/button` | Button — Atech | 200 | `14` | Tactile mechanical switch (`button_pressed`, `button_released`) |
| 15 | `/modules/distance-sensor` | Distance Sensor — Atech | 200 | `15` | VL53L0X Time-of-Flight laser ranging sensor (20–2000 mm) |
| 16 | `/modules/orientation-sensor` | Orientation Sensor — Atech | 200 | `16` | 6-axis IMU accelerometer + gyroscope (`tilt`, `shake_detected`) |
| 17 | `/modules/temp-sensor` | Temperature Sensor — Atech | 200 | `17` | SHT3x digital temperature (-40..125°C) & relative humidity (0..100%) |
| 18 | `/b/co2` | CO2 Monitor — Built with Atech | 200 | `18` | Showcase page with parts used, prompt, and 3D/video demonstration |
| 19 | `/b/soil` | Soil Monitor — Built with Atech | 200 | `19` | Smart plant watering & moisture monitor build showcase |
| 20 | `/b/tamagotchi` | Tamagotchi — Built with Atech | 200 | `20` | Handheld virtual pet build showcase |
| 21 | `/b/car` | RC Car — Built with Atech | 200 | `21` | WiFi/BLE remote-controlled rover showcase |
| 22 | `/docs` | Documentation — Atech | 200 | `22` | Quickstart, hardware port map, JSON serial wire protocol (115200 baud) |
| 23 | `/coding-agent-prompt` | Coding Agent Prompt — Atech | 200 | `23` | Copyable system prompt for Claude Code, Cursor, Codex, and Windsurf |
| 24 | `/mcp` | MCP Server — Atech | 200 | `24` | Model Context Protocol server setup (`npx @atech/mcp`) for AI agents |
| 25 | `/app` | App — Atech | 200 | `25` | Companion desktop/mobile app & WebSerial bridge overview |
| 26 | `/kids`, `/education`, `/industry`, `/hackathons` | Audience Verticals | 200 | `26`–`29`, `73` | Dedicated landing pages with tailored kits, lesson plans, and B2B inquiry forms |
| 27 | `/logos`, `/support`, `/more`, `/terms`, `/privacy` | Brand & Legal | 200 | `30`, `72`, `74` | Brand press kit, support channels, directory index, terms, privacy, Cookie Settings modal |
| 28 | `/cart` | Your Cart — Atech | 200 | `31`, `34`, `77` | Empty cart state + populated cart with quantity steppers, currency formatting, and Stripe checkout initiation |
| 29 | `/arena` | Arena · Atech | 200 | `65`, `68`, `69`, `70` | Interactive hardware physics testbench (`01 Atech Car` with 4 worlds & autonomous drive, `02 Tumbler` with toss/drop/spin/flip/shake & records, `03 Weather Station` with 6 climates & spray/breathe/hair-dryer controls) |
| 30 | `/factory-reset` | Factory reset · Atech | 200 | `66`, `71` | Restore out-of-the-box firmware (`Original setup 2026.10.21`) with live custom `"Name on the screen"` greeting preview (`160 × 80 ST7735`) & WebSerial flasher |
| 31 | `/editor` | Making hardware easy | 200 | `67`, `76` | Quick voice/prompt hardware editor with 7 rotating prompt presets, voice dictation (`"Listening…"`), `"Build this →"` Studio launcher, and `$ pip install atech` snippet |
| 32 | `/modules/radar`, `/modules/gps`, `/modules/nfc`, `/modules/lora`, `/modules/slider`, `/modules/joystick`, `/modules/light-sensor`, `/modules/ir` | Additional Module Detail Pages | 200 | `78`–`86` | All 21 individual hardware module pages verified with 3D render, specs, pinout, and JSON serial protocol reference |
| 33 | `/b/drums`, `/b/clawd`, `/b/lapper` | Additional Build Showcases | 200 | `87`–`89` | Electronic Drums, Clawd desktop companion, and RC Lap Timer build showcases |

---

## 4. Route & Workflow Coverage Matrix — `https://studio.atech.dev/` (Studio)

| # | Route / View | State | Screenshot(s) | Key Elements & Interactions Verified |
|---|--------------|-------|---------------|--------------------------------------|
| 1 | `/` (Signed out & Signed in) | Hero + Setupflow | `04_studio_home_1440`, `38`, `39`, `56` | Interactive 3D Game Console showcase (`emu/showcase.js`) with live playable screen, rotary knob, button, audio synthesizer; prompt textarea (`#prompt`) with attachments & voice input; 7 showcase pills (`ARCADE`, `CLAWD`, `ROVER`, `DESK LAMP`, `SOUND LIGHT`, `SCALE`, `PLANT MONITOR`) |
| 2 | `/#modules` | Hardware Catalog | `40` | 63 hardware items across 3 sourcing modes (`Atech only`, `Atech first`, `Any hardware`) and 9 categories (`sensor`, `led`, `input`, `audio`, `actuator`, `display`, `motor`, `robotics`, `boards`), search filter, 3D part inspection modal |
| 3 | `/projects/:id` (Overview Deck) | Project Editor (`Advanced` & `Simple`) | `41`, `42`, `46`, `57`, `60` | Left-pane multi-turn AI chat + prompt composer; Right-pane 3-card overview deck (`Electronics`, `Firmware`, `WiFi`) in Advanced mode or unified guided view in Simple mode |
| 4 | `/projects/:id/ELECTRONICS` | 3D Board Editor | `43`, `59` | Three.js 3D motherboard & module placement viewer (`boardview.js`), camera presets (`TOP`, `FRONT`, `RIGHT`, `BACK`, `LEFT`, `ISO`), 3D firmware emulation toggle (`Emulate`), port map validation, BOM & wiring tabs |
| 5 | `/projects/:id/FIRMWARE` | Firmware Editor & Flasher | `45`, `61` | Multi-file C++/Arduino firmware viewer (`main.cpp`, `transport.h`, `wifi_gateway.h`), version selector (`v11`), ZIP/file download, WebSerial 115200-baud flashing panel, WiFi SSID/PSK configuration, live WebSocket action/event tester |
| 6 | `/projects` | Projects Gallery | `05_studio_projects`, `47`, `48` | Signed-out empty state + Authenticated project grid (`2 projects`), isometric 3D board cover cards (`3 modules placed`, `9 modules placed`), star/unstar toggle, `Post →` to Community button |
| 7 | `/community` | Community Hub | `06_studio_community`, `49`, `51`, `58`, `62` | Category filter bar (`All`, `Game`, `Robotics`, `Smart home`, `Gadgets`), search input, build cards (`Duet`, `Hope`, `swv`), heart voting, Post Detail modal with 3D viewer + `Build →` project fork action, `Post a build` creation modal |
| 8 | `/account` | Profile & Settings | `07_studio_account`, `52`, `53`, `54` | Sticky section nav (`Identity`, `Plan & credits`, `Appearance`, `Privacy`, `Usage`, `History`, `Projects`, `Session`, `Data`); Display name & avatar editor; Account type selector (`hobbyist`, `student`, `teacher`, `industry`); Plan cards (`Free 2,000 cr`, `Standard 10,000 cr`, `Pro 40,000 cr`, `Max`); Credit packs; Theme mode (`Light`/`Dark`/`System`) & 6 Accent swatches (`AURORA`, `EMBER`, `MOSS`, `OCEAN`, `VIOLET`, `MONO`); JSON data export & account deletion |
| 9 | `/dashboard.html` | Admin Dashboard | `64` | 11 operational tabs (`Builds`, `Ratings`, `Errors`, `Token spend`, `Activity`, `Modules`, `Projects`, `Accounts`, `Inquiries`, `Support`, `Infrastructure`), KPI cards, SVG charts, expandable `<details>` tables |
| 10 | `/board.html` & `/projects/:id/board` | Standalone 3D Board & Port Inspector | `90`, `91` | `"Your board — the port assignment ELECTRONICS computed"`, 3D motherboard + module stage, slot/GPIO pinout table, `3V3`/`5V` power rail budget pills |
| 11 | `/modules.html` & `/projects/:id/modules` | 63-Part Hardware Catalog & 3D Turntable | `92`–`96` | Searchable 63-part catalog (`12` Atech + `14` boards + `37` kit parts), 3-tier sourcing control (`Atech only`, `Atech first`, `Any hardware`) persisted via `PATCH /api/projects/:id/settings/inventory`, and inline 3D Module Turntable Preview (`Render | 3D model`, CAD bounding box, capabilities) |
| 12 | `/#quotes`, `/#setupflow`, `#sharebtn` | Builder Quotes, 7-Build Coverflow & Follow Along | `97`–`100` | 6 builder quotes (`#quotes`), 7-build interactive coverflow (`#setupflow`), and `"Follow along"` social dropdown (`#sharebtn`) |
| 13 | Edge / Error States | 404 & Support Modal | `55`, `63` | Custom Studio 404 card (`404 — NOT FOUND / That page doesn't exist`), floating Support ticket modal (`#support-modal`), unauthenticated route gating, honest unmeasured `—` metrics |
