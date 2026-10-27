# Atech — Modular Electronics Storefront & AI Firmware Studio

A full-stack, production-ready replication of **`atech.dev`** (Hardware Kits, 21 Snap-In Modules, 7 Showcases, Multi-Currency Cart, Verticals, and Developer Docs) and **`studio.atech.dev`** (Prompt-to-Product AI Hardware & ESP32-S3 C++ Firmware Studio, Interactive 3D Motherboard Digital Twin & Live Emulator, Projects Workspace, Community Hub, Account Settings, and Operational Admin Control Plane) with **Invite-Only Registration, Role-Based Access Control (RBAC), Session Revocation, and Immutable Security Audit Logging**.

## Architecture & Engineering Documentation (`/docs`)

1. [`docs/00_EXPLORATION_COVERAGE.md`](./docs/00_EXPLORATION_COVERAGE.md) — Live Playwright exploration ledger & 65 screenshots index (`screenshots/00`–`64`).
2. [`docs/01_ADR_ARCHITECTURE_DECISION_RECORDS.md`](./docs/01_ADR_ARCHITECTURE_DECISION_RECORDS.md) — ADRs for Next.js App Router, Dual SQLite/PostgreSQL Prisma 7, Invite-Only Auth, and 3D Board Engine.
3. [`docs/02_PRD_PRODUCT_REQUIREMENTS.md`](./docs/02_PRD_PRODUCT_REQUIREMENTS.md) — Product Requirements Document & personas.
4. [`docs/03_TECHNICAL_SPECIFICATION.md`](./docs/03_TECHNICAL_SPECIFICATION.md) — REST API contracts, state machines, and security model.
5. [`docs/04_ARCHITECTURE_AND_DATA_MODEL.md`](./docs/04_ARCHITECTURE_AND_DATA_MODEL.md) — Entity-Relationship diagrams and SQLite/PostgreSQL schemas.
6. [`docs/05_IMPLEMENTATION_PLAN.md`](./docs/05_IMPLEMENTATION_PLAN.md) — Phased implementation & verification strategy.
7. [`docs/06_TASK_BACKLOG.md`](./docs/06_TASK_BACKLOG.md) — Engineering backlog across epics.
8. [`docs/07_ACCEPTANCE_CRITERIA.md`](./docs/07_ACCEPTANCE_CRITERIA.md) — Given/When/Then acceptance criteria.
9. [`docs/08_FEATURE_PARITY_MATRIX.md`](./docs/08_FEATURE_PARITY_MATRIX.md) — Feature-by-feature parity matrix against `atech.dev` & `studio.atech.dev`.

## Quickstart (Local SQLite Development)

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Mint a single-use bootstrap ADMIN invitation code (zero dummy users created)
npm run invite:bootstrap

# Start the development server
npm run dev
```

## Production PostgreSQL Deployment

```bash
# Validate and generate using the PostgreSQL Prisma schema
npx prisma validate --schema=prisma/schema.postgres.prisma
npm run build
npm run start
```
