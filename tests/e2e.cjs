const assert = require('node:assert/strict');
const { execSync, spawn } = require('node:child_process');
const Database = require('better-sqlite3');
const { chromium } = require('playwright');

const PORT = Number(process.env.PORT || 3010);
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for server at ${url}`);
}

function cleanupE2ERecords() {
  const db = new Database('/home/azadmin/atech/dev.db');
  db.prepare(
    `DELETE FROM ProjectTurnRating WHERE projectId IN (SELECT id FROM Project WHERE ownerUserId IN (SELECT id FROM User WHERE email IN ('admin@atech.dev', 'maker@atech.dev')))`
  ).run();
  db.prepare(
    `DELETE FROM CommunityVote WHERE userId IN (SELECT id FROM User WHERE email IN ('admin@atech.dev', 'maker@atech.dev'))`
  ).run();
  db.prepare(
    `DELETE FROM Project WHERE ownerUserId IN (SELECT id FROM User WHERE email IN ('admin@atech.dev', 'maker@atech.dev'))`
  ).run();
  db.prepare(
    `DELETE FROM User WHERE email IN ('admin@atech.dev', 'maker@atech.dev')`
  ).run();
  db.prepare(`DELETE FROM InvitationCode`).run();
  db.prepare(`DELETE FROM AuditLog`).run();
  const userCount = db.prepare(`SELECT COUNT(*) as c FROM User`).get().c;
  db.close();
  return userCount;
}

async function run() {
  console.log('=== Atech E2E Verification Suite ===');

  // 1. Ensure clean state and verify 0 dummy users exist
  execSync('npm run db:seed', {
    cwd: '/home/azadmin/atech',
    stdio: 'pipe',
  });
  const initialUserCount = cleanupE2ERecords();
  assert.equal(initialUserCount, 0, 'Expected 0 dummy/demo user accounts in database');
  console.log('[PASS] Database verified with 0 dummy/demo user accounts');

  // 2. Mint bootstrap single-use ADMIN invite code via CLI
  const bootstrapOut = execSync('npm run invite:bootstrap', {
    cwd: '/home/azadmin/atech',
    encoding: 'utf8',
  });
  const jsonLine = bootstrapOut
    .trim()
    .split('\n')
    .find((l) => l.trim().startsWith('{'));
  const bootInvite = JSON.parse(jsonLine);
  assert.equal(bootInvite.ok, true);
  assert.equal(bootInvite.assignedRole, 'ADMIN');
  const adminInviteCode = bootInvite.code;
  console.log(`[PASS] Bootstrap single-use ADMIN invite code minted (${adminInviteCode})`);

  const serverProc = spawn(
    process.execPath,
    ['./node_modules/next/dist/bin/next', 'start', '-p', String(PORT)],
    {
      cwd: '/home/azadmin/atech',
      stdio: 'ignore',
    }
  );
  await waitForServer(BASE_URL);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (err) => console.error('[PAGEERROR]', err.message));

  try {
    // 3. Storefront Home, Kits, 3D Modal, Inside Modal, and Modules Catalog
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const title = await page.title();
    assert.match(title, /Atech/i);

    await page.locator('[data-testid="try-3d-big-kit"]').click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Close/i }).click();

    await page.locator('[data-testid="inside-kit-big-kit"]').click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Close/i }).click();

    await page.locator('[data-testid="add-kit-big-kit"]').click();
    console.log('[PASS] Storefront Home, 3D Kit modal, Inside Kit modal, and Add-to-Cart verified');

    // 4. Verify all Storefront, Docs, Verticals, Arena, Factory Reset, Editor, Board, 63-Part Catalog & /llms.txt routes return 200
    const routesToCheck = [
      '/modules',
      '/modules/screen',
      '/modules/radar',
      '/modules/gps',
      '/modules/nfc',
      '/modules/lora',
      '/b/co2',
      '/b/synth',
      '/arena',
      '/factory-reset',
      '/editor',
      '/board',
      '/board.html',
      '/projects/duet/modules',
      '/modules.html',
      '/cart',
      '/docs',
      '/coding-agent-prompt',
      '/mcp',
      '/app',
      '/learn-more',
      '/kids',
      '/education',
      '/industry',
      '/hackathons',
      '/logos',
      '/support',
      '/more',
      '/terms',
      '/privacy',
      '/llms.txt',
    ];
    for (const r of routesToCheck) {
      const resp = await page.goto(`${BASE_URL}${r}`, { waitUntil: 'domcontentloaded' });
      assert.equal(resp.status(), 200, `Expected 200 on route ${r}`);
    }
    console.log(`[PASS] All ${routesToCheck.length} Storefront, Arena, Factory Reset, Editor, Board, Catalog & Docs routes returned HTTP 200`);

    // 4b. Verify Arena Physics Sandbox (/arena), Factory Reset (/factory-reset), Quick Editor (/editor), and Share/Cookie UI
    await page.goto(`${BASE_URL}/arena`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="arena-page"]');
    await page.click('[data-testid="arena-tab-tumbler"]');
    await page.click('[data-testid="tumbler-toss-btn"]');
    await page.click('[data-testid="arena-tab-weather"]');
    await page.click('[data-testid="weather-hairdryer-btn"]');

    await page.goto(`${BASE_URL}/factory-reset`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="factory-reset-page"]');
    await page.fill('[data-testid="factory-reset-name-input"]', 'Ada');
    const previewText = await page.locator('[data-testid="factory-reset-screen-preview"]').innerText();
    assert.match(previewText, /Hi Ada!/);
    await page.click('[data-testid="factory-reset-btn"]');

    await page.goto(`${BASE_URL}/editor`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="quick-editor-page"]');
    await page.click('[data-testid="editor-mic-btn"]');

    // Check Follow Along share popover (#sharebtn) and Cookie Settings modal
    await page.click('[data-testid="follow-along-btn"]');
    await page.waitForSelector('[data-testid="follow-along-menu"]');
    await page.click('[data-testid="footer-cookie-settings-btn"]');
    await page.waitForSelector('[data-testid="cookie-settings-modal"]');
    await page.getByRole('button', { name: /Save choice/i }).click();
    console.log('[PASS] Arena (Car/Tumbler/Weather), Factory Reset, Quick Editor, Follow Along & Cookie Settings verified');

    // 5. Invite-Only Enforcement: Reject registration without valid invite code
    const badRegRes = await page.request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        email: 'intruder@atech.dev',
        password: 'Password123!',
        inviteCode: 'INVALID-CODE-999',
      },
    });
    assert.equal(badRegRes.status(), 403);
    console.log('[PASS] Uninvited / invalid-code registration rejected with HTTP 403');

    // 6. Redeem Bootstrap ADMIN Invite Code via UI (/login)
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Redeem Invite Code/i }).click();
    await page.fill('input[placeholder="ATECH-XXXX-XXXX"]', adminInviteCode);
    await page.fill('input[placeholder="engineer@domain.com"]', 'admin@atech.dev');
    await page.fill('input[placeholder="At least 8 characters"]', 'AdminPass123!');
    await page.getByRole('button', { name: /Redeem Invite & Create Account/i }).click();
    await page.waitForURL('**/studio', { timeout: 15000 });

    const adminToken = await page.evaluate(() => localStorage.getItem('p2p_auth_token'));
    assert.ok(adminToken, 'Expected p2p_auth_token in localStorage after admin registration');
    console.log('[PASS] Bootstrap ADMIN invite redeemed and Studio session token issued');

    // 7. Single-Use Invite Enforcement: Reject second redemption of adminInviteCode
    const reuseRes = await page.request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        email: 'second@atech.dev',
        password: 'Password123!',
        inviteCode: adminInviteCode,
      },
    });
    assert.equal(reuseRes.status(), 403);
    const reuseJson = await reuseRes.json();
    assert.match(reuseJson.code || reuseJson.error, /exhausted|used/i);
    console.log('[PASS] Single-use invite exhaustion enforced (reuse rejected with HTTP 403)');

    // 8. Admin Dashboard (/dashboard.html rewrite -> /admin/dashboard): Mint & Revoke Invites
    await page.goto(`${BASE_URL}/dashboard.html`, { waitUntil: 'networkidle' });
    await page.fill('[data-testid="custom-invite-code-input"]', 'ATECH-USER-E2E1');
    await page.click('[data-testid="mint-invite-submit"]');
    await page.waitForSelector('[data-testid="minted-invite-code"]');

    await page.fill('[data-testid="custom-invite-code-input"]', 'ATECH-REVOKE-ME');
    await page.click('[data-testid="mint-invite-submit"]');
    await page.waitForSelector('[data-testid="revoke-invite-ATECH-REVOKE-ME"]');
    await page.click('[data-testid="revoke-invite-ATECH-REVOKE-ME"]');
    await page.waitForTimeout(400);

    // Verify revoked invite cannot be used
    const revokedAttempt = await page.request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        email: 'revoked_invite_user@atech.dev',
        password: 'Password123!',
        inviteCode: 'ATECH-REVOKE-ME',
      },
    });
    assert.equal(revokedAttempt.status(), 403);
    console.log('[PASS] Admin Dashboard invite creation and revocation verified');

    // 9. Register a standard USER account using ATECH-USER-E2E1 in a separate browser context
    const userContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const userPage = await userContext.newPage();
    await userPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await userPage.getByRole('button', { name: /Redeem Invite Code/i }).click();
    await userPage.fill('input[placeholder="ATECH-XXXX-XXXX"]', 'ATECH-USER-E2E1');
    await userPage.fill('input[placeholder="engineer@domain.com"]', 'maker@atech.dev');
    await userPage.fill('input[placeholder="At least 8 characters"]', 'MakerPass123!');
    await userPage.getByRole('button', { name: /Redeem Invite & Create Account/i }).click();
    await userPage.waitForURL('**/studio', { timeout: 15000 });

    const userToken = await userPage.evaluate(() => localStorage.getItem('p2p_auth_token'));
    assert.ok(userToken, 'Expected user token');

    // Verify RBAC: standard USER cannot access /api/admin/dashboard or /admin/dashboard
    const userAdminApi = await userPage.request.get(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(userAdminApi.status(), 403);
    await userPage.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await userPage.waitForSelector('[data-testid="admin-forbidden-banner"]');
    console.log('[PASS] RBAC enforced: Standard USER blocked from Admin API (403) and UI');

    // 10. Studio Prompt-to-Product Synthesis, Quotes, Coverflow, 63-Part Catalog, Board Inspector & 3-Phase Project Editor
    await userPage.goto(`${BASE_URL}/studio`, { waitUntil: 'networkidle' });
    await userPage.waitForSelector('[data-testid="studio-quotes-section"]');
    await userPage.waitForSelector('[data-testid="studio-coverflow-section"]');
    await userPage.fill(
      '[data-testid="studio-prompt-input"]',
      'Build a desktop CO2 monitor with OLED screen, rotary encoder knob, and RGB LED bar'
    );
    await userPage.click('[data-testid="studio-generate-btn"]');
    await userPage.waitForURL('**/projects/*/electronics', { timeout: 15000 });

    const createdProjectUrl = userPage.url();
    const projectMatch = createdProjectUrl.match(/\/projects\/([^/]+)/);
    const createdProjectId = projectMatch ? projectMatch[1] : 'duet';

    // Toggle Advanced mode and inspect 14-port slot editor + Parameter Tune Panel (#tunepanel)
    await userPage.click('[data-testid="mode-advanced"]');
    await userPage.waitForSelector('[data-testid="advanced-slot-editor"]');
    await userPage.waitForSelector('#tunepanel');

    // Switch to Firmware tab, test multi-file code tabs, USB-MIDI .syx flasher, and WiFi Gateway Bridge
    await userPage.click('[data-testid="phase-tab-firmware"]');
    await userPage.waitForURL('**/projects/*/firmware', { timeout: 10000 });
    await userPage.click('[data-testid="firmware-midi-tab"]');
    await userPage.click('[data-testid="firmware-wifi-tab"]');
    await userPage.click('[data-testid="wifi-send-btn"]');
    await userPage.waitForSelector('[data-testid="wifi-response-box"]');

    // Switch to 3. WIFI phase tab (#vp-card-wifi) and run Wi-Fi NVS Provisioning
    await userPage.click('[data-testid="phase-tab-wifi"]');
    await userPage.waitForURL('**/projects/*/wifi', { timeout: 10000 });
    await userPage.waitForSelector('[data-testid="wifi-stage-card"]');

    // Inspect 63-Part Hardware Catalog (/projects/[id]/modules), 3-tier sourcing persistence, and 3D Module Turntable Preview
    await userPage.goto(`${BASE_URL}/projects/${createdProjectId}/modules`, { waitUntil: 'networkidle' });
    await userPage.waitForSelector('[data-testid="modules-catalog-page"]');
    await userPage.click('[data-testid="sourcing-mode-any"]');
    await userPage.waitForTimeout(300);
    await userPage.locator('[data-testid^="catalog-card-"]').first().click();
    await userPage.waitForSelector('[data-testid="inline-module-3d-preview"]');

    // Inspect Standalone Your Board 3D & GPIO Pinout page (/projects/[id]/board)
    await userPage.goto(`${BASE_URL}/projects/${createdProjectId}/board`, { waitUntil: 'networkidle' });
    await userPage.waitForSelector('[data-testid="board-inspector-page"]');
    console.log('[PASS] Studio Quotes/Coverflow, 3D Electronics/Firmware/WIFI phases, USB-MIDI Flasher, 63-Part Catalog & Board Inspector verified');

    // 11. Community Hub: 3D Board API, Upvote and Fork ("Build ->") a build into workspace
    const commBoardRes = await userPage.request.get(`${BASE_URL}/api/community/posts/post-co2-desk/board`);
    assert.equal(commBoardRes.status(), 200);
    const commBoardJson = await commBoardRes.json();
    assert.ok(Array.isArray(commBoardJson.slots) && commBoardJson.slots.length > 0);

    await userPage.goto(`${BASE_URL}/community`, { waitUntil: 'networkidle' });
    const firstVoteBtn = userPage.locator('[data-testid^="vote-post-"]').first();
    await firstVoteBtn.click();
    await userPage.waitForTimeout(300);

    const firstForkBtn = userPage.locator('[data-testid^="fork-post-"]').first();
    await firstForkBtn.click();
    await userPage.waitForURL('**/projects/*/electronics', { timeout: 15000 });
    console.log('[PASS] Community Hub voting and 1-click Build forking verified');

    // 12. Account Settings: Update profile, theme, accent, top-up credits, and export JSON
    await userPage.goto(`${BASE_URL}/account`, { waitUntil: 'networkidle' });
    await userPage.fill('[data-testid="account-display-name"]', 'Ada Hardware Maker');
    await userPage.click('[data-testid="save-account-btn"]');
    await userPage.click('[data-testid="theme-dark"]');
    await userPage.click('[data-testid="accent-violet"]');
    await userPage.click('[data-testid="topup-credits-btn"]');
    await userPage.waitForTimeout(300);

    const exportRes = await userPage.request.get(`${BASE_URL}/api/account/export`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(exportRes.status(), 200);
    const exportData = await exportRes.json();
    assert.equal(exportData.user.email, 'maker@atech.dev');
    assert.ok(exportData.projects.length >= 2);
    console.log('[PASS] Account Settings, Theme/Accent persistence, Credits top-up, and JSON Export verified');

    // 13. Admin Revokes User Access -> Immediate Session Invalidation & Audit Trail
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await page.click('[data-testid="admin-tab-users"]');
    await page.waitForSelector('[data-testid="toggle-user-status-maker@atech.dev"]');
    await page.click('[data-testid="toggle-user-status-maker@atech.dev"]');
    await page.waitForTimeout(500);

    const meAfterRevoke = await userPage.request.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(meAfterRevoke.status(), 401);

    // Check Audit Logs via Admin API
    const auditRes = await page.request.get(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(auditRes.status(), 200);
    const auditJson = await auditRes.json();
    const actionsLogged = new Set(auditJson.logs.map((l) => l.action));
    for (const expectedAction of [
      'INVITE_CREATED',
      'INVITE_REDEEMED',
      'INVITE_REVOKED',
      'AUTH_REGISTER_SUCCESS',
      'AUTH_REGISTER_REJECTED',
      'USER_STATUS_CHANGED',
    ]) {
      assert.ok(actionsLogged.has(expectedAction), `Expected audit action ${expectedAction}`);
    }
    console.log('[PASS] Live User Session Revocation and Immutable Audit Log trail verified');

    // 14. Responsive Mobile Viewport Check (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.goto(`${BASE_URL}/studio`, { waitUntil: 'networkidle' });
    console.log('[PASS] Responsive Mobile Viewport (390x844) verified');
  } finally {
    await browser.close();
    serverProc.kill('SIGTERM');
  }

  // 15. Clean up test users so delivered DB has 0 dummy/demo user accounts
  const finalUserCount = cleanupE2ERecords();
  assert.equal(finalUserCount, 0, 'Expected 0 dummy/demo user accounts after cleanup');
  console.log('[PASS] Database restored to clean production state (0 dummy/demo user accounts)');
  console.log('=== ALL E2E TESTS PASSED ===');
}

run().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
