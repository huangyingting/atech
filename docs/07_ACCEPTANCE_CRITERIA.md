# 07 — Acceptance Criteria

## AC-01: Invite-Only Registration, Single-Use/Expiring Codes, Revocation & Zero Demo Users

1. **Zero Dummy/Demo Accounts**:
   - **Given** a freshly migrated database,
   - **When** inspecting the `User` table and login/signup UI,
   - **Then** there are `0` pre-seeded dummy/demo users, and no demo login buttons exist.
2. **Registration Rejected Without Valid Invite Code**:
   - **Given** a visitor attempting to register via `/login` or `POST /api/auth/register`,
   - **When** they omit an invitation code or provide a non-existent, expired (`expiresAt <= now`), exhausted (`usedCount >= maxUses`), or revoked (`revokedAt != null`) code,
   - **Then** registration fails with HTTP `403` / `400`, no `User` row is created, and an `AUTH_REGISTER_REJECTED` entry is recorded in `AuditLog`.
3. **Single-Use Invitation Redemption**:
   - **Given** a valid single-use `InvitationCode` (`maxUses = 1`, `usedCount = 0`, `assignedRole = 'MEMBER'`),
   - **When** User A registers with that code,
   - **Then** User A is created with role `MEMBER`, the code's `usedCount` increments to `1`, `INVITE_REDEEMED` and `AUTH_REGISTER_SUCCESS` audit logs are written, and a subsequent attempt by User B to reuse the same code is rejected with `"Invitation code has already been used"`.
4. **Account & Invite Revocation**:
   - **Given** an active user or active invitation code,
   - **When** an `ADMIN` revokes the user or invitation code from `/admin/dashboard`,
   - **Then** the user's `status` becomes `REVOKED` (and `sessionVersion` increments, invalidating their session immediately), or the invite's `revokedAt` is set, and an immutable `AuditLog` entry is created.

---

## AC-02: Storefront, 21 Hardware Modules, 16 Currencies & Shopping Cart (`atech.dev` Parity)

1. **Storefront & Kit Configurator**:
   - **Given** a user visiting `/`,
   - **When** they switch country/currency (e.g. `US / USD`, `DK / DKK`, `SG / SGD`, `DE / EUR`),
   - **Then** all kit prices (**Small Kit**, **Big Kit**, **Chunky Kit**) and module prices update dynamically to the selected currency and persist across reloads.
2. **Interactive 3D Kit Viewer & Breakdown Modal**:
   - **Given** the kit pricing section on `/`,
   - **When** clicking **"Try it in 3D"** or **"See what's inside"**,
   - **Then** the interactive 3D kit preview modal or full module breakdown modal opens accurately.
3. **21 Module Detail Pages & Cart Checkout**:
   - **Given** `/modules` and `/modules/[slug]` for all 21 hardware modules,
   - **When** viewing any module (e.g. `/modules/motherboard-14port`, `/modules/led-grid`, `/modules/robot-arm`) and clicking **"Add to cart"**,
   - **Then** the nav cart badge increments, `/cart` displays the line item with quantity steppers, and completing checkout persists a `StoreOrder`.

---

## AC-03: Prompt-to-Product Studio, 3D Board Viewer, Emulator & Firmware (`studio.atech.dev` Parity)

1. **Interactive Hero Showcase & 63-Part Catalog**:
   - **Given** `/studio`,
   - **When** toggling between `ARCADE`, `CLAWD`, `ROVER`, `DESK LAMP`, `SOUND LIGHT`, `SCALE`, and `PLANT MONITOR` or browsing the 63-part Hardware Catalog (`Atech only`, `Atech first`, `Any hardware`),
   - **Then** the 3D showcase emulator and catalog grid update immediately and allow playable interaction or part inspection.
2. **Prompt-to-Product Project Synthesis**:
   - **Given** a user submitting a hardware prompt (e.g., `"Build a CO2 and temperature desk monitor with a 3x3 LED grid, screen, and button"`),
   - **When** `POST /api/projects` completes,
   - **Then** a persisted project opens at `/projects/[id]` with conflict-free 14-port placement (`ELECTRONICS`), BOM, wiring table, and complete multi-file ESP32-S3 C++ source code (`FIRMWARE`: `main.cpp`, `transport.h`, `wifi_gateway.h`, `platformio.ini`).
3. **Simple & Advanced Editor + 3D Emulation**:
   - **Given** an open project in `/projects/[id]`,
   - **When** toggling between **Simple** and **Advanced** mode, zooming into **Electronics** (`/projects/[id]/ELECTRONICS`) or **Firmware** (`/projects/[id]/FIRMWARE`), changing 3D camera presets (`TOP`, `FRONT`, `RIGHT`, `BACK`, `LEFT`, `ISO`), and activating **Emulate**,
   - **Then** the user can interact with virtual buttons, rotary knobs, and sensor sliders in real time and observe the live TFT screen, 3×3 RGB LED grid, and serial JSON events.

---

## AC-04: Community Hub, Account Settings & Admin Dashboard

1. **Community Hub Voting, Publishing & Forking (`Build →`)**:
   - **Given** `/community`,
   - **When** filtering by category (`All`, `Game`, `Robotics`, `Smart home`, `Gadgets`), opening a post detail modal (e.g. `"Duet"`), and clicking **"Build →"**,
   - **Then** a full copy of that project's electronics placement and firmware is forked into the user's Studio workspace and opened in the editor.
2. **Account Settings (`/account`)**:
   - **Given** an authenticated user on `/account`,
   - **When** updating their display name, account type (`hobbyist`, `student`, `teacher`, `industry`), theme mode (`Light`/`Dark`/`System`), or accent swatch (`AURORA`..`MONO`),
   - **Then** changes persist to the database, update the nav identity chip (`(H)/(S)/(T)/(I)`), and support full JSON data export (`/api/account/export`).
3. **Admin Dashboard (`/admin/dashboard` & `/dashboard.html`)**:
   - **Given** an authenticated `ADMIN` user,
   - **When** visiting `/admin/dashboard` (or `/dashboard.html`),
   - **Then** all 11 operational tabs (`Builds`, `Ratings`, `Errors`, `Token spend`, `Activity`, `Modules`, `Projects`, `Accounts`, `Inquiries`, `Support`, `Infrastructure`) plus **Invitation Codes** and **Audit Logs** render real database metrics and allow creating/revoking invite codes and managing users, while non-admin users receive HTTP `403`.
