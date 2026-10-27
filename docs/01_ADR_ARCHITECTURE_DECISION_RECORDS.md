# 01 — Architecture Decision Records (ADR)

## ADR-001: Unified Full-Stack Next.js App Router Architecture

- **Status**: Accepted
- **Context**: In production, Atech splits its surface across `https://atech.dev/` (marketing storefront, 21 module pages, 7 showcase builds, docs, regional pricing, cart) and `https://studio.atech.dev/` (Prompt-to-Product AI workbench, 3D board editor, emulator, projects gallery, community hub, account settings, admin dashboard). Both share the exact same navigation bar (`sitenav.js`), country/currency state (`atech_country`), design tokens (`tokens.css`), and brand identity.
- **Decision**: Implement a unified, production-ready **Next.js (latest stable App Router, TypeScript)** application that serves both the Storefront (`atech.dev` routes) and the Studio (`studio.atech.dev` routes) seamlessly within a single cohesive deployment while preserving every route, query parameter, API endpoint, and cross-surface interaction.
- **Consequences**:
  - Eliminates cross-subdomain CORS/cookie synchronization bugs while still supporting both `/studio` (and direct `/projects`, `/community`, `/account`, `/admin/dashboard`) and all storefront routes (`/`, `/learn-more`, `/modules/[slug]`, `/b/[slug]`, `/docs`, `/coding-agent-prompt`, `/mcp`, `/app`, `/kids`, `/education`, `/industry`, `/hackathons`, `/cart`).
  - Shared design tokens, navigation, cart drawer/page, currency state, and authentication session work uniformly across every page.

---

## ADR-002: Dual-Database Prisma 7 Architecture (SQLite Local Dev + PostgreSQL Production)

- **Status**: Accepted
- **Context**: The application requires zero-friction local development and testing alongside enterprise-grade relational persistence in production, matching the reference pattern in `../Arcade`.
- **Decision**: Use **Prisma ORM (v7)** with driver adapters:
  - **Local Development & CI/E2E Testing**: SQLite via `@prisma/adapter-better-sqlite3` (`prisma/schema.prisma`, `DATABASE_URL="file:./dev.db"`).
  - **Production Deployment**: PostgreSQL via `@prisma/adapter-pg` (`prisma/schema.postgres.prisma`, `DATABASE_URL="postgresql://..."`).
- **Consequences**:
  - Local developers and automated Playwright tests run against a real, migrated SQLite database with zero external container dependencies.
  - Production deployments target PostgreSQL with identical Prisma model semantics and automated migration scripts.

---

## ADR-003: Invite-Only Registration with Single-Use/Expiring Codes, RBAC Roles, Revocation, and Audit Logging

- **Status**: Accepted
- **Context**: Public unthrottled registration exposes AI hardware synthesis and compute credits to abuse. Referencing `../Arcade/docs/NEXTAUTH_INVITE_ONLY_SPEC.md`, the application must enforce strict invite-only account admission with single-use or expiring invitation codes, role-based access control (RBAC), account/invite revocation, and immutable audit logging, while supporting OTP/credential sign-in and **strictly prohibiting dummy or demo user accounts**.
- **Decision**:
  1. **NextAuth / Auth.js Session & Credential Provider**: Authenticate users via verified credentials / OTP verification backed by Prisma.
  2. **Single-Use & Expiring Invitation Codes (`InvitationCode`)**:
     - New user registration requires a valid invitation code (`code`, `role`, `accountType`, `maxUses`, `usedCount`, `expiresAt`, `revokedAt`, `createdById`).
     - Codes are validated atomically inside a serializable database transaction: checking existence, non-revoked status (`revokedAt IS NULL`), expiration (`expiresAt > now`), and remaining uses (`usedCount < maxUses`).
  3. **RBAC Roles & Account Types**:
     - **System Roles (`UserRole`)**: `ADMIN` (full access to `/admin/dashboard`, invite creation/revocation, user suspension/revocation, catalog & project moderation), `MEMBER` (full Studio build, community publishing, and storefront capabilities), `VIEWER` (read-only access to shared projects).
     - **Atech Account Persona (`AccountType`)**: `hobbyist` `(H)`, `student` `(S)`, `teacher` `(T)`, `industry` `(I)` — matching `studio.atech.dev` D9 identity badge specification.
  4. **Account & Session Revocation**:
     - Administrators can revoke any invitation code or revoke/suspend any user account (`status = 'REVOKED'`, `sessionVersion` incremented).
     - Every authenticated request and JWT refresh validates `user.status === 'ACTIVE'` and matches `sessionVersion`, immediately terminating revoked sessions.
  5. **Comprehensive Audit Logging (`AuditLog`)**:
     - Every security-sensitive and state-mutating event (`INVITE_CREATED`, `INVITE_REDEEMED`, `INVITE_REVOKED`, `AUTH_REGISTER_SUCCESS`, `AUTH_REGISTER_REJECTED`, `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILED`, `USER_ROLE_UPDATED`, `USER_REVOKED`, `PROJECT_CREATED`, `PROJECT_FORKED`, `COMMUNITY_POST_PUBLISHED`, `ADMIN_ACTION`) is recorded in `AuditLog` with actor ID, IP/user-agent metadata, target entity, and JSON diff payload.
  6. **Zero Dummy/Demo Users Policy**:
     - No hardcoded demo credentials, no seeded fake users, and no bypass buttons exist anywhere in the codebase or seed script.
     - Initial administrator bootstrap is performed via a deterministic CLI command (`npm run bootstrap:admin`) or environment-configured bootstrap invite token.

---

## ADR-004: Deterministic & AI-Assisted Hardware + Firmware Synthesis Engine

- **Status**: Accepted
- **Context**: In `studio.atech.dev`, entering a natural-language hardware prompt (or selecting one of the 7 showcase templates or forking a community project) produces a structured project snapshot with two primary phases:
  - `ELECTRONICS`: Selects the optimal board (`14port_board`, `8port_board`, or off-the-shelf MCU), maps required modules to legal ports (respecting 1-port vs 2-port adjacency, analog vs digital pin capabilities, and outward orientation geometry), and generates the Bill of Materials (`bom`), physical port `layout`, and `wiring` notes.
  - `FIRMWARE`: Generates complete, compilable ESP32-S3 Arduino/C++ source files (`main.cpp`, `transport.h`, `wifi_gateway.h`, `platformio.ini`), wire protocol event/action schemas (`wire`), and WebSerial flashing artifacts.
- **Decision**: Build a deterministic + LLM-extensible synthesis engine in `/src/lib/studio-engine.ts` grounded in the exact 63-part `/api/catalog` specification and port geometry rules from `studio.atech.dev`.
- **Consequences**:
  - Every prompt (whether matching a showcase like Arcade, Clawd, Rover, Desk Lamp, Sound Light, Scale, Plant Monitor, Duet, or arbitrary custom hardware descriptions) immediately synthesizes a valid, conflict-free port placement map, 3D assembly layout, BOM, and multi-file C++ firmware package adhering to the 115200-baud JSON wire protocol.

---

## ADR-005: Interactive 3D Board Viewer & Playable Hardware Emulator

- **Status**: Accepted
- **Context**: Both `atech.dev` ("Try it in 3D" kit viewer) and `studio.atech.dev` (Hero 3D Game Console showcase + Project Editor 3D Board Viewer with `TOP`, `FRONT`, `RIGHT`, `BACK`, `LEFT`, `ISO` camera presets, drag-and-drop port reassignment, and live firmware emulation) rely heavily on interactive 3D visualization and real-time hardware emulation.
- **Decision**: Implement an interactive 3D WebGL/Canvas + SVG isometric/perspective board renderer and live hardware emulator supporting:
  - Camera preset transitions (`TOP`, `FRONT`, `RIGHT`, `BACK`, `LEFT`, `ISO`), turntable spin, and zoom.
  - Live interactive module controls during emulation: pressing physical/virtual `Button`, turning the `Knob` encoder, adjusting `Distance Sensor` / `Soil Sensor` / `Temperature Sensor` / `CO2 Sensor` sliders, viewing live 240×240 `Screen` graphics (including playable Snake/Brick-Breaker/Duet/Plant Monitor apps), 3×3 RGB `LED Grid` animations, and Web Audio API `Speaker` tone synthesis.
