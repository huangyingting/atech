# 03 — Technical Specification

## 1. Visual Design System & CSS Tokens

Extracted directly from `studio.atech.dev/tokens.css` and `atech.dev`:

### 1.1 Color Tokens (Light & Dark Modes)
- **Light Mode (Default)**:
  - `--bg`: `#FAFAFA` (Studio) / `#FFFFFF` (Storefront cards)
  - `--bg-elev`: `#FFFFFF`
  - `--bg-subtle`: `#F4F4F5`
  - `--fg`: `#0A0A0A`
  - `--fg-2`: `#52525B`
  - `--fg-3`: `#A1A1AA`
  - `--line`: `#E4E4E7`
  - `--line-strong`: `#D4D4D8`
- **Dark Mode (`[data-theme="dark"]`)**:
  - `--bg`: `#09090B`
  - `--bg-elev`: `#121215`
  - `--bg-subtle`: `#18181B`
  - `--fg`: `#FAFAFA`
  - `--fg-2`: `#A1A1AA`
  - `--fg-3`: `#71717A`
  - `--line`: `#27272A`
- **6 Accent Palettes (`[data-accent="..."]`)**:
  - `aurora` (Default): `#10B981` / `#06B6D4` gradient (`--accent: #0D9488`)
  - `ember`: `#F59E0B` / `#EF4444` (`--accent: #EA580C`)
  - `moss`: `#22C55E` / `#15803D` (`--accent: #16A34A`)
  - `ocean`: `#3B82F6` / `#0284C7` (`--accent: #2563EB`)
  - `violet`: `#8B5CF6` / `#6D28D9` (`--accent: #7C3AED`)
  - `mono`: `#18181B` / `#52525B` (`--accent: #18181B`)

### 1.2 Typography & Geometry
- **Display Font**: `'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif` (headings, hero titles, numeric callouts, module titles).
- **Body Font**: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`.
- **Monospace Font**: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace` (firmware code, port labels, serial protocol JSON, metrics).
- **Radii**: `--r-xs: 6px`, `--r-sm: 8px`, `--r-md: 12px`, `--r-lg: 16px`, `--r-xl: 22px`, `--r-pill: 999px`.

---

## 2. Atech Hardware Port Map & JSON Serial Wire Protocol

### 2.1 14-Port Motherboard Topology (`14port_board`)
- **MCU**: ESP32-S3-WROOM-1 (Dual-core XTensa LX7 @ 240 MHz, 8 MB Octal PSRAM, 16 MB QSPI Flash, Wi-Fi 802.11 b/g/n 2.4 GHz, BLE 5.0).
- **Port Layout**:
  - **Left Column (Top to Bottom)**: `port_1`, `port_2`, `port_3`, `port_4`, `port_5`, `port_6`
  - **Top Middle Slot**: `port_7`
  - **Bottom Middle Slot**: `port_8` (Reserved: USB-C Data + Power & LiPo charging)
  - **Right Column (Top to Bottom)**: `port_9`, `port_10`, `port_11`, `port_12` (Reserved: Reset button), `port_13`, `port_14`
- **Double-Width (2-Port) Legal Adjacent Pairs**:
  - Left side: `["port_1","port_2"]`, `["port_2","port_3"]`, `["port_3","port_4"]`, `["port_4","port_5"]`, `["port_5","port_6"]`
  - Right side: `["port_9","port_10"]`, `["port_10","port_11"]`, `["port_13","port_14"]`
  - Single-width (1-Port) modules can occupy any of `port_1`..`port_7`, `port_9`..`port_11`, `port_13`..`port_14` (with `analog` sensors restricted to ADC-capable ports `port_1`..`port_7`).

### 2.2 JSON Serial & WebSocket Wire Protocol (115200 Baud)
All communication between the motherboard and host computer/gateway uses newline-delimited JSON (`\n`):
- **Device → Host (Events)**:
  ```json
  {"event":"button_pressed","port":7}
  {"event":"knob_turned","port":3,"delta":1,"position":14}
  {"event":"distance_mm","port":6,"value":142}
  {"event":"soil_moisture","port":2,"percent":64}
  {"event":"temp_humidity","port":5,"temp_c":22.4,"humidity_pct":48.1}
  {"event":"co2_ppm","port":1,"ppm":615}
  ```
- **Host → Device (Actions)**:
  ```json
  {"action":"set_pixel","port":9,"x":1,"y":1,"r":0,"g":255,"b":128}
  {"action":"fill_grid","port":9,"r":255,"g":0,"b":64}
  {"action":"display_text","port":13,"title":"Duet","body":"Listening..."}
  {"action":"play_note","port":3,"frequency":440,"duration_ms":250}
  {"action":"set_motor_speed","port":1,"speed":75}
  {"action":"set_joint_angles","port":1,"j1":90,"j2":45,"j3":120}
  ```

---

## 3. REST API Specification

### 3.1 Authentication, Invite Codes & Account APIs
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/[...nextauth]` | `GET/POST` | Public | NextAuth session, sign-in, and sign-out handlers |
| `/api/auth/register` | `POST` | Public (Requires Invite Code) | Validates single-use/expiring `inviteCode`, creates `User`, increments `usedCount`, writes `AuditLog` |
| `/api/auth/signup` | `POST` | Public (Requires Invite Code) | Studio-compatible registration endpoint |
| `/api/auth/login` | `POST` | Public | Studio-compatible credential login returning session + JWT |
| `/api/auth/me` | `GET` | Auth | Returns current user identity, role, accountType, and session validity |
| `/api/account` | `GET/PATCH/DELETE` | Auth | Reads/updates `display_name`, `account_type`, `theme`, `accent`, `plan`, or deletes account |
| `/api/account/export` | `GET` | Auth | Exports complete user profile, projects, turns, and audit history as JSON |
| `/api/account/credits` | `POST` | Auth | Purchases/adds a credit pack (`10,000`, `50,000`, `200,000` credits) or switches plan |

### 3.2 Studio Catalog, Projects & Emulation APIs
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/catalog` | `GET` | Public | Returns full 63-part hardware catalog (`modules`, `boards`, `offtheshelf_boards`, `ky_modules`, `sourcing_modes`) |
| `/api/showcases` | `GET` | Public | Returns the 7 interactive Studio showcase templates (`arcade`, `clawd`, `rover`, `desklamp`, `soundlight`, `scale`, `plant`) |
| `/api/projects` | `GET/POST` | Public/Auth | Lists user's projects or synthesizes a new project from `prompt`, `sourcing`, and `board` |
| `/api/projects/[id]` | `GET/PATCH/DELETE` | Public/Auth | Returns full project snapshot (`phases`, `placement`, `emulation`, `consistency`, `events`, `jobs`), updates brief/placements, or deletes project |
| `/api/projects/[id]/turn` | `POST` | Public/Auth | Executes an iterative AI chat turn on `ELECTRONICS` and/or `FIRMWARE` phase (`write_seq` concurrency check) |
| `/api/projects/[id]/turns/[jobId]/rating` | `POST` | Auth | Records thumbs-up/down (`up`/`down`) rating and optional feedback on a build turn |
| `/api/projects/[id]/star` | `POST` | Auth | Toggles `starred` status on a project |
| `/api/projects/[id]/claim` | `POST` | Auth | Claims an anonymously created project into the signed-in user's account |
| `/api/projects/[id]/tree/[phase]/[key]/[version]` | `GET` | Public/Auth | Returns the generated source tree (`main.cpp`, `transport.h`, `wifi_gateway.h`, `platformio.ini`, `README.md`) |
| `/api/projects/[id]/device/send` | `POST` | Public/Auth | Dispatches a live JSON action payload to the emulated or WiFi-connected board and returns resulting state/events |

### 3.3 Community, Storefront, Support & Admin APIs
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/community/posts` | `GET/POST` | Public/Auth | Lists published community builds (with category/search filter) or publishes a new build |
| `/api/community/posts/[id]/vote` | `POST` | Auth | Toggles heart vote on a community post and returns updated `score` |
| `/api/community/posts/[id]/build` | `POST` | Public/Auth | Forks/clones a community post's hardware & firmware project into the user's Studio workspace |
| `/api/cart/checkout` | `POST` | Public/Auth | Creates a persisted kit/module order with regional currency calculation |
| `/api/support` | `POST` | Public/Auth | Submits a support ticket with diagnostic context (`page`, `project_id`, `message`) |
| `/api/inquiries` | `POST` | Public/Auth | Submits an Education/Industry/Hackathon B2B inquiry |
| `/api/admin/dashboard` | `GET` | `ADMIN` | Returns aggregated telemetry across all 11 dashboard tabs (`Builds`, `Ratings`, `Errors`, `Token spend`, `Activity`, `Modules`, `Projects`, `Accounts`, `Inquiries`, `Support`, `Infrastructure`) |
| `/api/admin/invites` | `GET/POST/PATCH` | `ADMIN` | Lists, generates, or revokes single-use/expiring invitation codes |
| `/api/admin/users/[id]` | `PATCH` | `ADMIN` | Updates user role (`ADMIN`/`MEMBER`/`VIEWER`), plan, or revokes/restores account access |
| `/api/admin/audit-logs` | `GET` | `ADMIN` | Queries immutable `AuditLog` entries with filtering by action, actor, or target |
