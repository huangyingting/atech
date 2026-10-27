# 06 — Engineering Task Backlog

| ID | Epic | Task Title | Priority | Dependencies | Status |
|----|------|------------|----------|--------------|--------|
| `BL-01` | Discovery | Playwright reconnaissance & screenshot capture of `atech.dev` (26 routes, modals, cart, dark/mobile) | P0 | — | Done |
| `BL-02` | Discovery | Live OTP registration & Playwright reconnaissance of `studio.atech.dev` (Workbench, 3D Editor, Catalog, Gallery, Community, Account, Dashboard) | P0 | `BL-01` | Done |
| `BL-03` | Architecture | Author ADR, PRD, Technical Spec, Architecture/Data Model, Implementation Plan, Task Backlog, Acceptance Criteria, and Feature-Parity docs | P0 | `BL-02` | Done |
| `BL-04` | Foundation | Scaffold Next.js 16 + TypeScript + Prisma 7 dual-database setup (`schema.prisma` SQLite + `schema.postgres.prisma` PostgreSQL) | P0 | `BL-03` | Pending |
| `BL-05` | Security & Auth | Implement NextAuth + Invite-Only registration (`InvitationCode` single-use, expiration, email lock, role/persona assignment, revocation) | P0 | `BL-04` | Pending |
| `BL-06` | Security & Auth | Implement RBAC (`ADMIN`, `MEMBER`, `VIEWER`), account revocation (`sessionVersion`), immutable `AuditLog` service, and CLI bootstrap script (zero demo users) | P0 | `BL-05` | Pending |
| `BL-07` | Hardware Engine | Port full 63-part Studio catalog (`api_catalog.json`), 21 storefront module specs, and 7 showcase templates (`api_showcases.json`) into typed catalog modules | P0 | `BL-04` | Pending |
| `BL-08` | Hardware Engine | Build conflict-free 14-port / 10-port placement solver, BOM generator, and ESP32-S3 C++ firmware synthesizer (`main.cpp`, `transport.h`, `wifi_gateway.h`) | P0 | `BL-07` | Pending |
| `BL-09` | Shared UI | Build `SiteNav` header, 16-currency regional switcher (`atech_country`), theme/accent engine (`Light`/`Dark`/`System` + 6 accents), and floating Support modal | P0 | `BL-04` | Pending |
| `BL-10` | Storefront | Build Storefront Home (`/`), Kit Configurator (Small/Big/Chunky), "Try it in 3D" interactive modal, and "See what's inside" breakdown modal | P0 | `BL-09` | Pending |
| `BL-11` | Storefront | Build `/modules` catalog and `/modules/[slug]` detail pages for all 21 modules with interactive serial protocol tester and Add-to-Cart | P0 | `BL-10` | Pending |
| `BL-12` | Storefront | Build `/b/[slug]` showcase pages (`co2`, `soil`, `tamagotchi`, `car`, `drums`, `clawd`, `lapper`) and `/cart` checkout workflow | P1 | `BL-10` | Pending |
| `BL-13` | Storefront | Build `/docs`, `/coding-agent-prompt`, `/mcp`, `/app`, `/learn-more`, `/kids`, `/education`, `/industry`, `/hackathons`, `/logos`, `/support`, `/more`, `/terms`, `/privacy`, `/llms.txt` | P1 | `BL-09` | Pending |
| `BL-14` | Studio | Build Studio Workbench (`/studio`) with playable 3D Game Console showcase, 7 showcase template pills, prompt composer, and 63-part Hardware Catalog | P0 | `BL-08`, `BL-09` | Pending |
| `BL-15` | Studio | Build Project Editor (`/projects/[id]`, `/projects/[id]/ELECTRONICS`, `/projects/[id]/FIRMWARE`) with Simple/Advanced toggle, AI chat turns, ratings, and 3-card deck | P0 | `BL-14` | Pending |
| `BL-16` | Studio | Build interactive 3D Board Viewer (`TOP`, `FRONT`, `RIGHT`, `BACK`, `LEFT`, `ISO`), port drag/reassignment, and live Hardware Emulator (Screen, LED grid, Speaker, Knob, Sensors) | P0 | `BL-15` | Pending |
| `BL-17` | Studio | Build Firmware Code Viewer, ZIP/file download, WebSerial 115200-baud flashing bridge, and WiFi Gateway live action/event console | P1 | `BL-15` | Pending |
| `BL-18` | Studio | Build Projects Gallery (`/projects`) and Community Hub (`/community`) with category filters, voting, 3D post modal, `Build →` project fork, and `Post a build` | P0 | `BL-15` | Pending |
| `BL-19` | Account & Admin | Build Account Settings (`/account`) and 11-tab Admin Dashboard (`/admin/dashboard` & `/dashboard.html`) with Invite Code & Audit Log management | P0 | `BL-06`, `BL-15` | Pending |
| `BL-20` | Verification | Run Prisma migrations, unit/integration tests, production build, and end-to-end Playwright verification suite | P0 | `BL-01`..`BL-19` | Pending |
