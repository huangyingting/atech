# 02 — Product Requirements Document (PRD)

## 1. Product Vision & Overview

**Atech** ("Build custom electronics with AI" / "Prompt to Product") is a modular hardware and AI engineering platform created in Copenhagen. It combines:
1. **Modular Plug-and-Play Hardware (`atech.dev`)**: A 14-port (and 10-port) ESP32-S3 motherboard and 21 snap-in sensors, screens, speakers, motors, and actuators that connect via standardized numbered ports without breadboards, soldering, or wiring errors.
2. **AI Hardware & Firmware Studio (`studio.atech.dev`)**: A web-based engineering environment where users describe a product in plain English, inspect and customize the 3D module placement, emulate the device interactively in the browser, inspect/edit the generated C++ firmware, flash a physical board over WebSerial USB, and control/monitor live devices over a WiFi WebSocket gateway.

---

## 2. Target User Personas

| Persona | Account Type Badge | Needs & Primary Workflows |
|---------|--------------------|---------------------------|
| **Hobbyist / Maker** | `hobbyist` `(H)` | Rapidly prototype home automation, games, and gadgets from prompts; order Small/Big/Chunky kits; remix community builds. |
| **Student** | `student` `(S)` | Learn embedded systems and physical computing without soldering frustration; visualize port mappings and read clean C++ firmware. |
| **Teacher / Educator** | `teacher` `(T)` | Classroom curriculum (`10-week course`), multi-kit bundles, safe browser-based 3D emulation before handing out hardware. |
| **Industrial / R&D Engineer** | `industry` `(I)` | Rapid PoC sensor fixtures, square-wave voltammetry / load-cell / environmental telemetry, custom off-the-shelf MCU + KY sensor sourcing, enterprise inquiries. |
| **Platform Administrator** | `ADMIN` Role | Issue & revoke single-use/expiring invitation codes, monitor build health, token spend, user accounts, support tickets, B2B inquiries, and audit logs. |

---

## 3. Functional Requirements

### 3.1 Storefront & Marketing (`atech.dev` Surface)
- **FR-STORE-01 (Hero & Showcases)**: Display the hero showcase, interactive "Built with the kit" carousel (`/b/co2`, `/b/soil`, `/b/tamagotchi`, `/b/car`, `/b/drums`, `/b/clawd`, `/b/lapper`), and direct deep-links into the Studio workbench.
- **FR-STORE-02 (Kits & Regional Multi-Currency Pricing)**:
  - Present the 3 flagship kits: **Small Kit** (10 modules, base $129 USD), **Big Kit** (20 modules, base $199 USD, "Most popular"), and **Chunky Kit** (30 modules, base $499 USD, "Free international shipping").
  - Support interactive **"Try it in 3D"** modal and **"See what's inside"** kit breakdown modal.
  - Support all 16 regional currencies (`USD`, `EUR`, `DKK`, `SEK`, `NOK`, `GBP`, `CAD`, `BRL`, `JPY`, `KRW`, `SGD`, `AUD`, `INR`, `CHF`, `PLN`) persisted via cookie/localStorage.
- **FR-STORE-03 (21 Hardware Module Pages)**:
  - Provide `/modules` catalog index and dedicated detail pages `/modules/[slug]` for all 21 modules (`motherboard-14port`, `motherboard-10port`, `robot-arm`, `soil-sensor`, `knob`, `screen`, `speaker`, `microphone`, `dc-motor`, `led-grid`, `button`, `distance-sensor`, `orientation-sensor`, `temp-sensor`, `usb-c`, `co2-sensor`, `micro-sd`, `big-screen`, `camera`, `power-jack`, `load-cell`, `frame-2`) with physical dimensions, port requirements, JSON wire protocol events/actions, and individual "Add to cart" actions.
- **FR-STORE-04 (Shopping Cart & Checkout Flow)**:
  - Full `/cart` page and nav badge (`atech_cart_count`) supporting kits and individual modules, quantity adjustment, line-item removal, shipping calculation, and order checkout persistence.
- **FR-STORE-05 (Documentation, Agent Prompts, MCP & Vertical Pages)**:
  - Complete `/docs`, `/coding-agent-prompt` (with one-click copy for Claude/Cursor/Codex), `/mcp`, `/app`, `/learn-more`, `/kids`, `/education`, `/industry` (with B2B inquiry submission), `/hackathons`, `/logos`, `/support`, `/more`, `/terms`, `/privacy`, and `/llms.txt`.

### 3.2 Authentication & Invite-Only Access Control
- **FR-AUTH-01 (Invite-Only Registration)**:
  - Registration requires a valid, unrevoked, non-expired invitation code with available redemptions (`usedCount < maxUses`).
  - Supports single-use (`maxUses = 1`) and multi-use expiring invitation codes, optionally pre-bound to a specific email address, system role (`ADMIN`, `MEMBER`, `VIEWER`), and account type (`hobbyist`, `student`, `teacher`, `industry`).
- **FR-AUTH-02 (Zero Dummy/Demo Users)**:
  - The database must never be seeded with dummy or demo user accounts.
  - Provide a secure CLI bootstrap utility and environment bootstrap token so an initial administrator can create the first real account and issue invitation codes.
- **FR-AUTH-03 (Revocation & Audit Trail)**:
  - Administrators can revoke invitation codes and suspend/revoke user accounts at any time, immediately invalidating active sessions.
  - Every registration attempt, login, invite creation/revocation, role change, and admin operation writes an immutable record to `AuditLog`.

### 3.3 Prompt-to-Product Studio (`studio.atech.dev` Surface)
- **FR-STUDIO-01 (Hero Workbench & Playable 3D Showcase)**:
  - Interactive 3D showcase stage featuring the playable Game Console (`ARCADE`) and 6 additional live hardware templates (`CLAWD`, `ROVER`, `DESK LAMP`, `SOUND LIGHT`, `SCALE`, `PLANT MONITOR`).
  - Rich prompt box with file attachment support, voice dictation toggle, sourcing mode selector, and one-click project generation.
- **FR-STUDIO-02 (63-Part Hardware Catalog)**:
  - Interactive catalog browser supporting 3 sourcing modes (`atech_only`, `atech_preferred` / "Atech first", `any_hardware`), 9 category filters (`sensor`, `led`, `input`, `audio`, `actuator`, `display`, `motor`, `robotics`, `boards`), live search, and 3D CAD / pinout inspection modal.
- **FR-STUDIO-03 (Project Editor — Simple & Advanced Modes)**:
  - Left pane: Multi-turn AI engineering chat (`projectchat`), phase run cards (`ELECTRONICS`, `FIRMWARE`), thumbs-up/down turn ratings, and prompt bar for iterative hardware/firmware changes.
  - Right pane: Toggle between **Simple** mode (guided step-by-step build & flash) and **Advanced** mode (3-card overview deck: **Electronics**, **Firmware**, **WiFi** with zoom-in focus views `/projects/[id]/ELECTRONICS` and `/projects/[id]/FIRMWARE`).
- **FR-STUDIO-04 (3D Board Viewer, Port Placement & Live Emulator)**:
  - Interactive 3D board visualization with camera presets (`TOP`, `FRONT`, `RIGHT`, `BACK`, `LEFT`, `ISO`), spin toggle, audio mute, port labels, module drag/reassignment across legal ports, BOM table, and live interactive firmware emulation (`Emulate` mode with interactive sensors, buttons, knob, LED grid, speaker audio, and TFT screen).
- **FR-STUDIO-05 (Firmware Viewer, WebSerial Flasher & WiFi Gateway)**:
  - Multi-file syntax-highlighted code viewer (`main.cpp`, `transport.h`, `wifi_gateway.h`, `platformio.ini`), revision history, ZIP/file download, WebSerial 115200-baud flashing integration, WiFi SSID/password injection, and live action/event JSON testing console.
- **FR-STUDIO-06 (Projects Gallery & Community Hub)**:
  - `/projects`: Personal project gallery with isometric board covers, module count badges, star/unstar filtering, anonymous project claiming, project deletion, and "Post →" to Community.
  - `/community`: Public build showcase with category filtering (`All`, `Game`, `Robotics`, `Smart home`, `Gadgets`), search, heart voting, post detail modal with 3D preview, **"Build →"** one-click project forking into the user's Studio workspace, and **"Post a build"** publishing flow.
- **FR-STUDIO-07 (Account Settings & Admin Dashboard)**:
  - `/account`: Identity management (display name, avatar, account type `H`/`S`/`T`/`I`), Plan & Credits meter (`Free`, `Standard`, `Pro`, `Max` + credit pack top-up), Appearance (`Light`/`Dark`/`System` + 6 accent palettes), Privacy, Usage/History, Projects list, Session inspector, JSON Data Export, and Account Deletion.
  - `/admin/dashboard` & `/dashboard.html`: 11 operational tabs (`Builds`, `Ratings`, `Errors`, `Token spend`, `Activity`, `Modules`, `Projects`, `Accounts`, `Inquiries`, `Support`, `Infrastructure`) + **Invites & Audit Logs** management panel.
