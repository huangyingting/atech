import Link from 'next/link';

export default function MoreHubPage() {
  const links = [
    { href: '/', title: 'Storefront Home', desc: 'Kits, showcases, and 3D hardware explorer' },
    { href: '/modules', title: '21 Hardware Modules', desc: 'Complete snap-in module catalog' },
    { href: '/projects/duet/modules', title: '63-Part Hardware Catalog', desc: '12 Atech modules, 14 boards, 37 kit parts & 3D CAD turntable' },
    { href: '/arena', title: 'Arena Physics Sandbox', desc: 'Interactive 01 Atech Car, 02 Tumbler & 03 Weather Station testbench' },
    { href: '/factory-reset', title: 'Factory Reset Tool', desc: 'Restore out-of-the-box firmware with custom screen greeting' },
    { href: '/editor', title: 'Quick Voice & Prompt Editor', desc: 'Describe or dictate hardware ideas & pip install atech' },
    { href: '/board?project=duet', title: 'Your Board 3D Inspector', desc: 'Standalone 3D board, GPIO pinout & power rail budget' },
    { href: '/studio', title: 'AI Firmware Studio', desc: 'Prompt-to-Product workbench' },
    { href: '/projects', title: 'Your Projects', desc: 'Saved hardware & firmware builds' },
    { href: '/community', title: 'Community Hub', desc: 'Upvote, inspect, and fork shared builds' },
    { href: '/docs', title: 'Developer Docs', desc: '14-port pinout and C++ SDK reference' },
    { href: '/coding-agent-prompt', title: 'Coding Agent Prompt', desc: 'System prompt for Claude/Cursor/Copilot' },
    { href: '/mcp', title: 'MCP Server', desc: 'Model Context Protocol hardware bridge' },
    { href: '/app', title: 'Companion App', desc: 'BLE & Wi-Fi mobile/desktop bridge' },
    { href: '/learn-more', title: 'How Studio Works', desc: 'Prompt → Electronics → Firmware architecture' },
    { href: '/kids', title: 'Atech for Kids', desc: 'Safe solderless invention for families' },
    { href: '/education', title: 'Atech for Education', desc: 'Classroom 10-packs and STEM curriculum' },
    { href: '/industry', title: 'Atech for Industry', desc: 'Rapid R&D hardware prototyping' },
    { href: '/hackathons', title: 'Atech for Hackathons', desc: '24-hour hardware hackathon kits' },
    { href: '/logos', title: 'Custom Co-Branded Kits', desc: 'Custom PCB silkscreen and laser etching' },
    { href: '/account', title: 'Account Settings', desc: 'Profile, credits, themes, and JSON export' },
    { href: '/admin/dashboard', title: 'Admin & Invite Dashboard', desc: 'Invite codes, RBAC, and audit logs' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
          COMPLETE SITEMAP
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold mt-1">
          Everything on Atech
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 hover:border-teal-500 transition space-y-1"
          >
            <div className="font-display font-bold text-base">{item.title}</div>
            <p className="text-xs text-zinc-500">{item.desc}</p>
            <div className="text-[11px] font-mono text-teal-600 pt-1">{item.href} →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
