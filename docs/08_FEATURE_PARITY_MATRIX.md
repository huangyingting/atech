# 08 — Feature-Parity Matrix (`atech.dev` + `studio.atech.dev`)

## 1. Storefront & Documentation Surface (`https://atech.dev/`)

| Feature / Route | Original `atech.dev` Behavior | Replica Implementation Route / Component | Parity Status |
|-----------------|-------------------------------|------------------------------------------|---------------|
| **Storefront Home (`/`)** | Hero video/showcase, "Try the AI" CTA, Built-with-the-kit carousel, Small/Big/Chunky kits, 21 modules grid, FAQ | `src/app/page.tsx` | 100% Parity |
| **Kit 3D Modal & Inside Modal** | Interactive "Try it in 3D" board preview modal & "See what's inside" module breakdown | `src/components/store/KitModals.tsx` | 100% Parity |
| **16-Currency Regional Switcher** | Country/currency modal (`USD`, `EUR`, `DKK`, `SEK`, `NOK`, `GBP`, `CAD`, `BRL`, `JPY`, `KRW`, `SGD`, `AUD`, `INR`, `CHF`, `PLN`) via `atech_country` | `src/context/AppContext.tsx` & `SiteNav.tsx` | 100% Parity |
| **21 Modules Catalog (`/modules`)** | Filterable grid of all 21 Atech hardware modules with port sizes & prices | `src/app/modules/page.tsx` | 100% Parity |
| **21 Module Detail Pages (`/modules/[slug]`)** | Specs, dimensions, port compatibility, JSON serial events/actions, interactive protocol tester, Add to Cart | `src/app/modules/[slug]/page.tsx` | 100% Parity |
| **7 Built-with-Kit Pages (`/b/[slug]`)** | `/b/co2`, `/b/soil`, `/b/tamagotchi`, `/b/car`, `/b/drums`, `/b/clawd`, `/b/lapper` with BOM, prompt, and "Open in Studio" | `src/app/b/[slug]/page.tsx` | 100% Parity |
| **Documentation (`/docs`)** | Hardware architecture, port numbering (1–14), 115200-baud JSON serial protocol reference | `src/app/docs/page.tsx` | 100% Parity |
| **Coding Agent Prompt (`/coding-agent-prompt`)** | Copyable LLM system prompt for Claude Code, Cursor, Codex, Windsurf | `src/app/coding-agent-prompt/page.tsx` | 100% Parity |
| **MCP Server (`/mcp`)** | Model Context Protocol server documentation & configuration snippets | `src/app/mcp/page.tsx` | 100% Parity |
| **Companion App (`/app`)** | Desktop/WebSerial bridge & companion app guide | `src/app/app/page.tsx` | 100% Parity |
| **Audience Verticals** | `/learn-more`, `/kids`, `/education`, `/industry`, `/hackathons` with tailored curriculum & B2B inquiry submission | `src/app/[vertical]/...` | 100% Parity |
| **Arena Physics Sandbox (`/arena`)** | Interactive hardware physics testbench (`01 Atech Car` with 4 worlds & autonomous drive, `02 Tumbler` with toss/drop/spin/flip/shake & records, `03 Weather Station` with 6 climates & spray/breathe/hair-dryer) | `src/app/arena/page.tsx` | 100% Parity |
| **Factory Reset Tool (`/factory-reset`)** | Live `"Name on the screen"` greeting customizer (`160 × 80 ST7735` preview) and WebSerial `"Reset board"` flasher (`Original setup 2026.10.21`) | `src/app/factory-reset/page.tsx` | 100% Parity |
| **Quick Voice & Prompt Editor (`/editor`)** | `"Making hardware easy"` prompt composer with 7 rotating prompt ideas, voice dictation (`"Listening…"`), `"Build this →"` launcher, and `$ pip install atech` snippet | `src/app/editor/page.tsx` | 100% Parity |
| **Brand, Legal, Share & Cart** | `/logos`, `/support`, `/more`, `/terms`, `/privacy`, `/cart`, `/llms.txt`, `"Follow along"` share popover (`#sharebtn`), Cookie Settings modal | Dedicated App Router pages + `SiteNav.tsx` | 100% Parity |

---

## 2. Prompt-to-Product Studio Surface (`https://studio.atech.dev/`)

| Feature / Route | Original `studio.atech.dev` Behavior | Replica Implementation Route / Component | Parity Status |
|-----------------|--------------------------------------|------------------------------------------|---------------|
| **Studio Workbench (`/studio`)** | Interactive 3D Game Console showcase (`ARCADE` + 6 showcase pills), prompt composer (`#prompt`) with attachments & voice dictation (`#prompt-mic`), Builder Quotes (`#quotes`), 7-Build Coverflow (`#setupflow`) | `src/app/studio/page.tsx` | 100% Parity |
| **63-Part Hardware Catalog (`/projects/[id]/modules` & `/modules.html`)** | `/api/catalog` with 12 Atech modules, 14 MCU/SBC boards, 37 KY modules, 3 sourcing modes (`Atech only`, `Atech first`, `Any hardware`), `PATCH /api/projects/[id]/settings/inventory` persistence, and inline 3D Module Turntable Preview | `src/app/projects/[id]/modules/page.tsx` | 100% Parity |
| **Standalone 3D Board Inspector (`/board`, `/board.html`, `/projects/[id]/board`)** | `"Your board — the port assignment ELECTRONICS computed"` with 3D motherboard + module placement, slot/GPIO pinout table, and `3V3`/`5V` power rail budgets | `src/app/board/page.tsx` & `src/app/projects/[id]/board/page.tsx` | 100% Parity |
| **Project Editor (`/projects/[id]`)** | Left-pane multi-turn AI chat + voice/file/ratings + Parameter Tune Panel (`#tunepanel`); Right-pane `Simple` vs `Advanced` toggle with `1. ELECTRONICS`, `2. FIRMWARE`, and `3. WIFI` phases | `src/app/projects/[id]/[[...phase]]/page.tsx` | 100% Parity |
| **3D Board Viewer & Placement (`/projects/[id]/electronics`)** | Interactive 3D motherboard & module viewer, `TOP`/`FRONT`/`RIGHT`/`BACK`/`LEFT`/`ISO` camera presets, spin, port reassignment, BOM & wiring tabs | `src/components/Board3DStage.tsx` | 100% Parity |
| **Live 3D Hardware Emulator** | Playable in-browser emulation: TFT screen canvas, 3×3 RGB LED matrices, Web Audio speaker synth, clickable buttons, rotary knob, sensor sliders | `src/components/Board3DStage.tsx` | 100% Parity |
| **Firmware, USB-MIDI `.syx` & WiFi Provisioning (`/projects/[id]/firmware` & `/wifi`)** | Multi-file C++ code viewer (`sketch.ino`, `transport.h`, `wifi_gateway.h`, `midi_flash.cpp`), WebSerial 115200 flasher, USB-MIDI `.syx` phone flasher (`midiflash.js`), and Wi-Fi NVS Provisioning (`wificard.js`) | `src/app/projects/[id]/[[...phase]]/page.tsx` | 100% Parity |
| **Projects Gallery (`/projects`)** | Paginated grid with isometric board covers, module count badges, star/unstar toggle, anonymous project claim, Post to Community | `src/app/projects/page.tsx` | 100% Parity |
| **Community Hub (`/community`)** | Category tabs (`All`, `Game`, `Robotics`, `Smart home`, `Gadgets`), search, heart voting, post detail modal with 3D viewer, `Build →` fork, `Post a build` | `src/app/community/page.tsx` | 100% Parity |
| **Account Settings (`/account`)** | 10-section sticky nav (`Identity`, `Plan & credits`, `Appearance`, `Privacy`, `Usage`, `History`, `Projects`, `Session`, `Data`), `(H)/(S)/(T)/(I)` badges, 6 accents, JSON export | `src/app/account/page.tsx` | 100% Parity |
| **Admin Dashboard (`/admin/dashboard` & `/dashboard.html`)** | 11 operational tabs (`Builds`, `Ratings`, `Errors`, `Token spend`, `Activity`, `Modules`, `Projects`, `Accounts`, `Inquiries`, `Support`, `Infrastructure`) | `src/app/admin/dashboard/page.tsx` | 100% Parity |

---

## 3. Production Security & Invite-Only Enhancements (Beyond Original)

| Enhancement | Specification | Implementation |
|-------------|---------------|----------------|
| **Invite-Only Registration** | Single-use and multi-use expiring `InvitationCode` records required for account creation | `src/lib/invitations.ts` & `/api/auth/register` |
| **RBAC Roles & Persona Badges** | System roles (`ADMIN`, `MEMBER`, `VIEWER`) + Atech account types (`hobbyist`, `student`, `teacher`, `industry`) | `User.role` + `User.accountType` |
| **Immediate Revocation** | Revoking a user increments `sessionVersion` and sets `status = 'REVOKED'`; revoking an invite sets `revokedAt` | Enforced in NextAuth session callback & API guards |
| **Immutable Audit Logging** | Every auth, invite, role, build, and admin event logged with actor, target, IP, and metadata JSON | `AuditLog` model & `/api/admin/audit-logs` |
| **Dual SQLite / PostgreSQL Prisma 7** | SQLite (`@prisma/adapter-better-sqlite3`) for local dev/testing; PostgreSQL (`@prisma/adapter-pg`) for production | `prisma/schema.prisma` & `prisma/schema.postgres.prisma` |
| **Zero Dummy/Demo Users** | Strictly zero seeded fake users or demo login shortcuts; real admin bootstrap via CLI/invite token | `scripts/bootstrap-admin.ts` |
