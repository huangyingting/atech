# 04 — System Architecture & Data Model

## 1. High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Browser Client (Next.js React 19)                   │
│                                                                            │
│  ┌──────────────────────────────┐     ┌─────────────────────────────────┐  │
│  │ Storefront Surface (atech.dev)│     │ Studio Surface (studio.atech.dev│  │
│  │ • Hero & Kit Configurator     │     │ • Hero 3D Console Showcase      │  │
│  │ • 21 Module Detail Pages      │     │ • 63-Part Hardware Catalog      │  │
│  │ • 7 Built-with-Kit Showcases  │     │ • Project Editor (Simple/Adv)   │  │
│  │ • Docs, MCP, Coding Prompts   │     │ • 3D Board Viewer & Emulator    │  │
│  │ • 16-Currency Switcher & Cart │     │ • C++ Firmware & WebSerial/WiFi │  │
│  └──────────────┬───────────────┘     │ • Gallery, Community, Account   │  │
│                 │                     │ • Admin Dashboard & Invites     │  │
│                 └──────────┬──────────┴────────────────┬────────────────┘  │
└────────────────────────────┼───────────────────────────┼───────────────────┘
                             │ HTTPS / REST / JSON       │
┌────────────────────────────▼───────────────────────────▼───────────────────┐
│                    Next.js App Router API & Server Layer                    │
│                                                                            │
│  ┌──────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │ Invite-Only Auth &   │  │ Hardware & Firmware   │  │ Admin, Audit &  │  │
│  │ RBAC Middleware      │  │ Synthesis Engine      │  │ Telemetry Engine│  │
│  │ • NextAuth JWT/DB    │  │ • Port Solver (14/10p)│  │ • 11 Admin Tabs │  │
│  │ • Single-Use/Expiring│  │ • 3D Layout Builder   │  │ • Invite Manager│  │
│  │   Invitation Codes   │  │ • C++ Code Generator  │  │ • Session Revoke│  │
│  │ • Session Version    │  │ • Device Gateway Sim  │  │ • Audit Logger  │  │
│  └──────────┬───────────┘  └───────────┬───────────┘  └────────┬────────┘  │
└─────────────┼──────────────────────────┼───────────────────────┼───────────┘
              │                          │                       │
┌─────────────▼──────────────────────────▼───────────────────────▼───────────┐
│               Prisma 7 Data Access Layer (Driver Adapters)                  │
│     Local Dev / Test: SQLite (@prisma/adapter-better-sqlite3)               │
│     Production:       PostgreSQL (@prisma/adapter-pg)                       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Relational Data Model (Prisma Schema)

### 2.1 Identity, Invite-Only Registration, RBAC & Audit Logging
- **`User`**:
  - `id` (UUID/CUID Primary Key)
  - `email` (Unique, lowercase normalized)
  - `passwordHash` (Bcrypt/Scrypt hashed password)
  - `displayName` (Nullable string — shown in nav identity chip per D9 spec)
  - `avatarUrl` (Nullable string)
  - `role` (`ADMIN` | `MEMBER` | `VIEWER`, default `MEMBER`)
  - `accountType` (`hobbyist` | `student` | `teacher` | `industry` | null)
  - `status` (`ACTIVE` | `REVOKED` | `SUSPENDED`, default `ACTIVE`)
  - `sessionVersion` (Int, default `1` — incremented on revocation to invalidate active JWTs)
  - `plan` (`free` | `standard` | `pro` | `max`, default `free`)
  - `creditsAllowance` (Int, default `2000`)
  - `creditsUsed` (Int, default `0`)
  - `creditsPurchased` (Int, default `0`)
  - `themeMode` (`light` | `dark` | `system`, default `light`)
  - `accentColor` (`aurora` | `ember` | `moss` | `ocean` | `violet` | `mono`, default `aurora`)
  - `analyticsConsent` (String, default `unset`)
  - `invitedByCodeId` (Nullable FK to `InvitationCode`)
  - `revokedAt` (Nullable DateTime), `revokedReason` (Nullable String)
  - `createdAt`, `updatedAt`

- **`InvitationCode`**:
  - `id` (PK)
  - `code` (Unique indexed string, e.g. `ATECH-XXXX-XXXX`)
  - `label` (Optional description / recipient note)
  - `emailHint` (Optional locked email address; if set, only that email can redeem)
  - `assignedRole` (`ADMIN` | `MEMBER` | `VIEWER`, default `MEMBER`)
  - `assignedAccountType` (Optional `hobbyist` | `student` | `teacher` | `industry`)
  - `maxUses` (Int, default `1` for single-use codes)
  - `usedCount` (Int, default `0`)
  - `expiresAt` (DateTime — enforces time-bounded validity)
  - `revokedAt` (Nullable DateTime — immediate revocation)
  - `createdById` (Nullable FK to `User`)
  - `createdAt`, `updatedAt`

- **`AuditLog`**:
  - `id` (PK)
  - `action` (Indexed string: `INVITE_CREATED`, `INVITE_REDEEMED`, `INVITE_REVOKED`, `AUTH_REGISTER_SUCCESS`, `AUTH_REGISTER_REJECTED`, `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILED`, `USER_REVOKED`, `USER_RESTORED`, `USER_ROLE_CHANGED`, `PROJECT_CREATED`, `PROJECT_DELETED`, `COMMUNITY_POST_CREATED`, etc.)
  - `actorUserId` (Nullable FK to `User`)
  - `actorEmail` (Nullable String)
  - `targetType` (`USER` | `INVITE` | `PROJECT` | `COMMUNITY_POST` | `ORDER` | `SYSTEM`)
  - `targetId` (Nullable String)
  - `ipAddress` (Nullable String)
  - `userAgent` (Nullable String)
  - `metadataJson` (Text JSON — structured before/after state and diagnostic fields)
  - `createdAt` (Indexed DateTime)

### 2.2 Studio Projects, Phases, Turns & Firmware Artifacts
- **`Project`**:
  - `id` (UUID PK)
  - `name`, `title`, `prompt`
  - `ownerUserId` (Nullable FK to `User` — supports anonymous session projects that can be claimed via `/api/projects/[id]/claim`)
  - `anonSessionId` (Nullable String)
  - `boardId` (String, default `14port_board`)
  - `sourcingMode` (`atech_only` | `atech_preferred` | `any_hardware`, default `atech_preferred`)
  - `currentPhase` (`ELECTRONICS` | `FIRMWARE` | `DONE`, default `DONE`)
  - `writeSeq` (Int, default `0`)
  - `starred` (Boolean, default `false`)
  - `featured` (Boolean, default `false`)
  - `forkedFromPostId` (Nullable String)
  - `briefJson` (Text JSON: `{ idea_text, chosen_name, user_constraints }`)
  - `placementJson` (Text JSON: board port map, placed module instances, legal ports, 3D geometry coordinates)
  - `electronicsArtifactsJson` (Text JSON: `{ bom, layout, wiring, checks }`)
  - `firmwareArtifactsJson` (Text JSON: `{ version, files: { "main.cpp": ..., "transport.h": ..., "wifi_gateway.h": ..., "platformio.ini": ... }, wire: { events, actions }, flashing }`)
  - `wifiConfigJson` (Text JSON: `{ ssid, gateway_connected, last_event, log }`)
  - `eventsJson` (Text JSON: chat turns, phase job logs, activity timeline)
  - `createdAt`, `updatedAt`

- **`ProjectTurnRating`**:
  - `id` (PK), `projectId` (FK), `jobId`, `userId` (Nullable FK), `rating` (`up` | `down`), `comment`, `createdAt`

### 2.3 Community Hub, Storefront Cart Orders, Support & Inquiries
- **`CommunityPost`**:
  - `id` (PK), `projectId` (Nullable FK to `Project`), `authorUserId` (Nullable FK to `User`), `authorHandle`, `title`, `summary`, `description`, `category` (`Game` | `Robotics` | `SmartHome` | `Gadgets`), `coverSvgOrUrl`, `modulesJson`, `score` (Int), `buildCount` (Int), `featured` (Boolean), `createdAt`, `updatedAt`
- **`CommunityVote`**:
  - `id` (PK), `postId` (FK), `userId` (FK), `voted` (Boolean), unique composite `[postId, userId]`
- **`StoreOrder`**:
  - `id` (PK), `userId` (Nullable FK), `email`, `countryCode`, `currency`, `itemsJson`, `subtotalMinor`, `shippingMinor`, `totalMinor`, `status`, `createdAt`
- **`SupportTicket`**:
  - `id` (PK), `userId` (Nullable FK), `email`, `pageUrl`, `projectId`, `subject`, `message`, `status` (`open` | `resolved`), `createdAt`
- **`EnterpriseInquiry`**:
  - `id` (PK), `vertical` (`education` | `industry` | `hackathons`), `name`, `email`, `organization`, `role`, `quantityEstimate`, `message`, `status`, `createdAt`
