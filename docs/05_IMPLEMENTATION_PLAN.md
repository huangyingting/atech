# 05 — Implementation Plan & Deployment Architecture

## 1. Implementation Phases

### Phase 1: Project Scaffolding & Dual-Database Prisma Setup
- Initialize Next.js 16 (App Router, TypeScript, Tailwind CSS + custom Atech CSS variables from `tokens.css`).
- Configure Prisma 7 with dual database targets:
  - `prisma/schema.prisma` (SQLite via `@prisma/adapter-better-sqlite3` for local dev & E2E tests).
  - `prisma/schema.postgres.prisma` (PostgreSQL via `@prisma/adapter-pg` for production).
- Run migrations (`npx prisma db push` / `prisma migrate`) and seed **only real hardware catalog / public showcase templates** (zero dummy or demo user accounts).

### Phase 2: Invite-Only Authentication, RBAC, Revocation & Audit Logging
- Implement `/src/lib/auth.ts` (NextAuth configuration + session version enforcement + Studio token bridge).
- Implement `/src/lib/invitations.ts` and `/src/lib/audit.ts` for atomic single-use/expiring invitation code redemption, revocation, role assignment (`ADMIN`, `MEMBER`, `VIEWER`), account type personas (`hobbyist`, `student`, `teacher`, `industry`), and immutable `AuditLog` persistence.
- Provide `/scripts/bootstrap-admin.ts` CLI utility and `BOOTSTRAP_INVITE_CODE` support for initial administrator onboarding without any seeded demo users.

### Phase 3: Hardware Catalog, Port Solver & Synthesis Engine
- Embed the complete 63-part hardware catalog (`12 Atech modules`, `2 Atech motherboards`, `14 off-the-shelf MCU/SBC boards`, `37 KY-series modules`) and the 21 storefront module specifications (`motherboard-14port` through `frame-2`).
- Implement `/src/lib/studio-engine.ts`:
  - Natural-language prompt analyzer & hardware matcher across `atech_only`, `atech_preferred`, and `any_hardware` sourcing modes.
  - Conflict-free 14-port and 10-port slot solver (handling 2-port adjacent modules like `screen`, `speaker`, `microphone` and ADC constraints).
  - Multi-file ESP32-S3 C++ firmware generator (`main.cpp`, `transport.h`, `wifi_gateway.h`, `platformio.ini`) implementing the 115200-baud JSON serial wire protocol.

### Phase 4: Storefront & Documentation Surface (`atech.dev` Parity)
- Implement shared top navigation (`SiteNav`) with country/16-currency picker, cart counter badge, Studio link, and user identity chip (`(H)/(S)/(T)/(I)`).
- Implement `/` (Storefront home: Hero, Built-with-the-Kit carousel, Small/Big/Chunky Kit cards with "Try it in 3D" interactive modal and "See what's inside" breakdown modal, 21 Modules grid, FAQ).
- Implement `/modules` and `/modules/[slug]` for all 21 hardware modules with interactive protocol tester and Add-to-Cart.
- Implement `/b/[slug]` for all 7 showcase builds (`co2`, `soil`, `tamagotchi`, `car`, `drums`, `clawd`, `lapper`) with "Open in Studio →" one-click build launch.
- Implement `/docs`, `/coding-agent-prompt`, `/mcp`, `/app`, `/learn-more`, `/kids`, `/education`, `/industry`, `/hackathons`, `/logos`, `/support`, `/more`, `/terms`, `/privacy`, `/cart`, and `/llms.txt`.

### Phase 5: Studio Workbench, 3D Board Viewer, Emulator & Community (`studio.atech.dev` Parity)
- Implement `/studio` (and query/path routing `/projects/[id]`, `/projects/[id]/ELECTRONICS`, `/projects/[id]/FIRMWARE`):
  - Hero 3D playable Game Console showcase + 7 template pills (`ARCADE`, `CLAWD`, `ROVER`, `DESK LAMP`, `SOUND LIGHT`, `SCALE`, `PLANT MONITOR`).
  - 63-part Hardware Catalog drawer/section with sourcing mode toggle, category pills, search, and 3D CAD modal.
  - Project Editor with **Simple** vs **Advanced** mode toggle, left-pane AI chat & turn ratings, and right-pane **Electronics**, **Firmware**, and **WiFi** cards.
  - Interactive 3D Board Viewer (`TOP`, `FRONT`, `RIGHT`, `BACK`, `LEFT`, `ISO` camera views, turntable spin, port labels, drag-and-drop port reassignment, and live **Emulate** mode with interactive sensors, buttons, rotary knob, RGB LED grids, speaker synthesizer, and 240×240 TFT display).
  - Firmware code viewer (`main.cpp`, `transport.h`, `wifi_gateway.h`), ZIP/file download, WebSerial 115200-baud flasher, and WiFi gateway live action/event console.
- Implement `/projects` (Projects Gallery with isometric covers, starring, claiming, and publishing to Community).
- Implement `/community` (Community Hub with category filters, search, heart voting, post detail modal with 3D viewer & `Build →` fork, and `Post a build` modal).
- Implement `/account` (10-section profile, plan/credits meter, theme/accent customizer, JSON data export, account deletion).
- Implement `/admin/dashboard` & `/dashboard.html` (11 operational tabs + Invite Code & Audit Log administration).

### Phase 6: Automated Verification & E2E Testing
- Run unit/integration tests and comprehensive Playwright E2E tests verifying invite-only registration, single-use/expired/revoked invite enforcement, RBAC, audit logging, storefront multi-currency cart & 21 modules, Studio prompt-to-product synthesis, 3D board emulation, community forking, and responsive layouts.

---

## 2. Production Deployment Configuration

- **Environment Variables (`.env.example`)**:
  - `DATABASE_URL`: `"file:./dev.db"` (local SQLite) or `"postgresql://user:pass@host:5432/atech?schema=public"` (production Postgres).
  - `NEXTAUTH_SECRET`: Cryptographic secret for session signing.
  - `NEXTAUTH_URL`: Canonical deployment URL.
  - `BOOTSTRAP_ADMIN_INVITE_CODE`: Optional single-use bootstrap code for provisioning the initial `ADMIN` account.
- **Database Scripts (`package.json`)**:
  - `npm run db:generate`: Generates Prisma client for SQLite.
  - `npm run db:push`: Pushes schema to local SQLite database.
  - `npm run db:migrate:prod`: Runs Prisma migrations against PostgreSQL using `prisma/schema.postgres.prisma`.
  - `npm run bootstrap:admin`: Creates/issues a single-use admin invitation code from the CLI.
