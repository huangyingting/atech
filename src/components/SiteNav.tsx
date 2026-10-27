'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useApp } from '@/context/AppContext';
import { REGIONAL_CURRENCIES } from '@/data/store-data';

const PERSONA_BADGE: Record<string, string> = {
  hobbyist: '(H)',
  student: '(S)',
  teacher: '(T)',
  industry: '(I)',
};

export function SiteNav() {
  const pathname = usePathname();
  const {
    user,
    countryCode,
    setCountryCode,
    cartTotalCount,
    authModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    setSessionFromPayload,
    signOut,
  } = useApp();

  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Auth modal form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountType, setAccountType] = useState<'hobbyist' | 'student' | 'teacher' | 'industry'>('hobbyist');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [inviteCheckStatus, setInviteCheckStatus] = useState<string | null>(null);

  // Support modal form state
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const handleCheckInviteCode = async (raw: string) => {
    if (!raw.trim()) {
      setInviteCheckStatus(null);
      return;
    }
    try {
      const res = await fetch(`/api/auth/register?code=${encodeURIComponent(raw.trim())}`);
      const data = await res.json();
      if (data.valid) {
        setInviteCheckStatus(`Valid invite (${data.assignedRole || 'MEMBER'})`);
      } else {
        setInviteCheckStatus(data.reason || 'Invalid code');
      }
    } catch {
      setInviteCheckStatus(null);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      if (authModalTab === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            inviteCode,
            displayName,
            accountType,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Invite-only registration failed.');
          setAuthSubmitting(false);
          return;
        }
        setSessionFromPayload(data);
        await signIn('credentials', { email, password, redirect: false }).catch(() => null);
        closeAuthModal();
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Invalid email or password.');
          setAuthSubmitting(false);
          return;
        }
        setSessionFromPayload(data);
        await signIn('credentials', { email, password, redirect: false }).catch(() => null);
        closeAuthModal();
      }
    } catch {
      setAuthError('Network error while authenticating.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: supportEmail || user?.email || 'visitor@atech.dev',
        page_url: pathname,
        message: supportMessage,
      }),
    });
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportMessage('');
      setSupportModalOpen(false);
    }, 1500);
  };

  const badgeSuffix = user?.account_type ? PERSONA_BADGE[user.account_type] || '' : '';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
              <span className="inline-flex items-center justify-center w-6 h-6">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 2L3 20h18L12 2zm0 5.8L16.6 17H7.4L12 7.8z" />
                </svg>
              </span>
              <span>Atech.dev</span>
            </Link>

            {/* Primary Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-full transition ${
                  pathname === '/'
                    ? 'text-zinc-950 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800'
                    : 'hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/modules"
                className={`px-3 py-1.5 rounded-full transition ${
                  pathname.startsWith('/modules')
                    ? 'text-zinc-950 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800'
                    : 'hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                Shop
              </Link>
              <Link
                href="/studio"
                className={`px-3 py-1.5 rounded-full transition ${
                  pathname.startsWith('/studio') || pathname.startsWith('/projects')
                    ? 'text-zinc-950 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800'
                    : 'hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                Vibe-engineering
              </Link>
              <Link
                href="/community"
                className={`px-3 py-1.5 rounded-full transition ${
                  pathname.startsWith('/community')
                    ? 'text-zinc-950 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800'
                    : 'hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                Community
              </Link>

              {/* More Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  className="px-3 py-1.5 rounded-full hover:text-zinc-950 dark:hover:text-white flex items-center gap-1"
                >
                  <span>More</span>
                  <span className="text-xs">▾</span>
                </button>
                {moreOpen && (
                  <div
                    onMouseLeave={() => setMoreOpen(false)}
                    className="absolute left-0 mt-2 w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-2 text-sm z-50"
                  >
                    <Link href="/learn-more" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Learn More
                    </Link>
                    <Link href="/docs" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Documentation & Wire Protocol
                    </Link>
                    <Link href="/coding-agent-prompt" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Coding Agent Prompt
                    </Link>
                    <Link href="/mcp" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      MCP Server
                    </Link>
                    <Link href="/app" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Companion App
                    </Link>
                    <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
                    <Link href="/kids" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      For Kids & Families
                    </Link>
                    <Link href="/education" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      For Education & Schools
                    </Link>
                    <Link href="/industry" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      For Industry & R&D
                    </Link>
                    <Link href="/hackathons" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Hackathons
                    </Link>
                    <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
                    <Link href="/arena" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-emerald-700 dark:text-emerald-400">
                      Arena Physics Sandbox
                    </Link>
                    <Link href="/factory-reset" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Factory Reset Tool
                    </Link>
                    <Link href="/editor" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Quick Voice &amp; Prompt Builder
                    </Link>
                    <Link href="/board?project=duet" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Your Board 3D Inspector
                    </Link>
                    <Link href="/projects/duet/modules" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      63-Part Hardware Catalog
                    </Link>
                    <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
                    <Link href="/more" onClick={() => setMoreOpen(false)} className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      All Pages Index
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Country / Currency Selector */}
            <button
              type="button"
              onClick={() => setCurrencyModalOpen(true)}
              data-testid="currency-selector-btn"
              className="px-2.5 py-1.5 rounded-full text-xs font-mono font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1"
              title="Select country & currency"
            >
              <span className="underline">{countryCode}</span>
              <span>🌐</span>
            </button>

            {/* Follow Along Share Menu (#sharebtn) */}
            <div className="relative">
              <button
                id="sharebtn"
                type="button"
                onClick={() => setShareMenuOpen((v) => !v)}
                data-testid="follow-along-btn"
                aria-label="Follow along"
                className="p-2 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
                title="Follow along"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                </svg>
              </button>
              {shareMenuOpen && (
                <div
                  onMouseLeave={() => setShareMenuOpen(false)}
                  data-testid="follow-along-menu"
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-2 text-xs z-50"
                >
                  <div className="px-3 py-1.5 text-[11px] font-medium text-zinc-400">
                    Follow along
                  </div>
                  {[
                    { name: 'Discord', handle: 'Join the community', href: 'https://discord.gg/atech' },
                    { name: 'YouTube', handle: '@Atech_development', href: 'https://youtube.com/@Atech_development' },
                    { name: 'Instagram', handle: '@atech_development', href: 'https://instagram.com/atech_development' },
                    { name: 'X', handle: '@Atech_dev', href: 'https://x.com/Atech_dev' },
                    { name: 'TikTok', handle: '@atech.dev', href: 'https://tiktok.com/@atech.dev' },
                    { name: 'LinkedIn', handle: 'Atech', href: 'https://linkedin.com/company/atech-dev' },
                    { name: 'Product Hunt', handle: 'Upvote & follow', href: 'https://producthunt.com' },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <span className="font-semibold text-zinc-900 dark:text-white">{item.name}</span>
                      <span className="text-zinc-500">{item.handle}</span>
                    </a>
                  ))}
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  <Link
                    href="/more"
                    onClick={() => setShareMenuOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span>↗ All links</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Cart Link */}
            <Link
              href="/cart"
              data-testid="nav-cart-link"
              className="relative px-2.5 py-1.5 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
            >
              <span>Cart</span>
              {cartTotalCount > 0 && (
                <span
                  data-testid="nav-cart-badge"
                  className="px-1.5 py-0.2 rounded-full bg-teal-600 text-white font-mono text-[11px] font-bold"
                >
                  {cartTotalCount}
                </span>
              )}
            </Link>

            {/* Open Editor CTA */}
            <Link
              href="/studio"
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 transition"
            >
              Open editor
            </Link>

            {/* User Identity Chip or Log in Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  data-testid="nav-user-chip"
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="w-6 h-6 rounded-full bg-zinc-900 text-white dark:bg-teal-500 dark:text-zinc-950 flex items-center justify-center font-bold uppercase">
                    {(user.display_name || user.email || 'A').charAt(0)}
                  </span>
                  <span className="max-w-[120px] truncate">
                    {user.display_name || user.email.split('@')[0]}
                  </span>
                  {badgeSuffix && (
                    <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                      {badgeSuffix}
                    </span>
                  )}
                  <span className="text-[10px]">▾</span>
                </button>

                {userMenuOpen && (
                  <div
                    onMouseLeave={() => setUserMenuOpen(false)}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-2 text-sm z-50"
                  >
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="font-semibold text-xs truncate">{user.email}</div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                        Role: {user.role} {badgeSuffix}
                      </div>
                    </div>
                    <Link
                      href="/projects"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Your projects
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Account & credits
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 font-semibold text-teal-600 dark:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      data-testid="nav-signout-btn"
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                data-testid="nav-login-btn"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Log in
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((m) => !m)}
              className="md:hidden p-2 rounded-lg border border-zinc-200 dark:border-zinc-800"
              aria-label="Toggle Menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-2 text-sm">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium">
              Home
            </Link>
            <Link href="/modules" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium">
              Shop (21 Modules & Kits)
            </Link>
            <Link href="/studio" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium">
              Studio Workbench
            </Link>
            <Link href="/projects" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium">
              Your Projects
            </Link>
            <Link href="/community" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium">
              Community Hub
            </Link>
            <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium">
              Documentation
            </Link>
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-medium">
              Account Settings
            </Link>
          </div>
        )}
      </header>

      {/* Country / Currency Picker Modal */}
      {currencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-display font-bold">Select Country & Currency</h2>
                <p className="text-xs text-zinc-500">
                  Prices across Storefront kits and modules update automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrencyModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {REGIONAL_CURRENCIES.map((c) => (
                <button
                  key={c.countryCode}
                  type="button"
                  onClick={() => {
                    setCountryCode(c.countryCode);
                    setCurrencyModalOpen(false);
                  }}
                  data-testid={`currency-opt-${c.countryCode}`}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${
                    countryCode === c.countryCode
                      ? 'border-zinc-900 dark:border-white bg-zinc-900/5 dark:bg-white/10 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  <div className="text-xs font-bold">
                    {c.countryCode} · {c.currency} ({c.symbol.trim()})
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate w-full">{c.countryName}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite-Only Sign-In / Registration Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div
            data-testid="auth-modal"
            className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-display font-bold text-lg">
                <span>▲</span>
                <span>Atech Studio</span>
              </div>
              <button
                type="button"
                onClick={closeAuthModal}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  openAuthModal('login');
                }}
                data-testid="auth-tab-login"
                className={`py-2 rounded-full transition ${
                  authModalTab === 'login'
                    ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs'
                    : 'text-zinc-500'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  openAuthModal('register');
                }}
                data-testid="auth-tab-register"
                className={`py-2 rounded-full transition ${
                  authModalTab === 'register'
                    ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs'
                    : 'text-zinc-500'
                }`}
              >
                Create account (Invite-only)
              </button>
            </div>

            {authError && (
              <div
                data-testid="auth-error-banner"
                className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium"
              >
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authModalTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Invitation Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      handleCheckInviteCode(e.target.value);
                    }}
                    placeholder="ATECH-XXXX-XXXX"
                    data-testid="auth-invite-input"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-sm uppercase"
                  />
                  {inviteCheckStatus && (
                    <p className="mt-1 text-[11px] font-mono text-zinc-500">{inviteCheckStatus}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  data-testid="auth-email-input"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  data-testid="auth-password-input"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                />
              </div>

              {authModalTab === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Display name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name or handle"
                      data-testid="auth-name-input"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Account persona</label>
                    <select
                      value={accountType}
                      onChange={(e) =>
                        setAccountType(
                          e.target.value as 'hobbyist' | 'student' | 'teacher' | 'industry'
                        )
                      }
                      data-testid="auth-persona-select"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                    >
                      <option value="hobbyist">Hobbyist (H)</option>
                      <option value="student">Student (S)</option>
                      <option value="teacher">Teacher (T)</option>
                      <option value="industry">Industry (I)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authSubmitting}
                data-testid="auth-submit-btn"
                className="w-full py-3 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {authSubmitting
                  ? 'Please wait...'
                  : authModalTab === 'register'
                  ? 'Redeem Invite & Create Account'
                  : 'Sign in to Atech'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Support Button (#support-fab) */}
      <button
        type="button"
        onClick={() => setSupportModalOpen(true)}
        data-testid="support-fab-btn"
        aria-label="Open Support"
        className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-lg flex items-center justify-center hover:scale-105 transition"
      >
        💬
      </button>

      {supportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base">Message Atech Engineering</h3>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>
            {supportSent ? (
              <div className="py-6 text-center text-sm text-emerald-600 font-medium">
                ✓ Support message recorded. Our Copenhagen hardware team will reply shortly.
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <input
                  type="email"
                  value={supportEmail || user?.email || ''}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                />
                <textarea
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your hardware, firmware, or order question..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
                >
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function SiteFooter() {
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [betaModalOpen, setBetaModalOpen] = useState(false);

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-500 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-5 gap-8">
        <div className="col-span-2 sm:col-span-1 space-y-2">
          <div className="font-display font-bold text-zinc-900 dark:text-white text-sm">
            ▲ Atech.dev
          </div>
          <p className="text-zinc-500 leading-relaxed">
            Modular plug-and-play electronics and AI firmware synthesis. Designed in Copenhagen.
          </p>
        </div>

        <div className="space-y-2">
          <div className="font-semibold text-zinc-900 dark:text-zinc-200">Hardware &amp; Shop</div>
          <ul className="space-y-1.5">
            <li><Link href="/" className="hover:underline">Starter Kits</Link></li>
            <li><Link href="/modules" className="hover:underline">All 21 Modules</Link></li>
            <li><Link href="/projects/duet/modules" className="hover:underline">63-Part Hardware Catalog</Link></li>
            <li><Link href="/cart" className="hover:underline">Shopping Cart</Link></li>
            <li><Link href="/learn-more" className="hover:underline">How It Works</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <div className="font-semibold text-zinc-900 dark:text-zinc-200">Studio &amp; Tools</div>
          <ul className="space-y-1.5">
            <li><Link href="/studio" className="hover:underline">Prompt-to-Product Studio</Link></li>
            <li><Link href="/arena" className="hover:underline">Arena Physics Sandbox</Link></li>
            <li><Link href="/factory-reset" className="hover:underline">Factory Reset Tool</Link></li>
            <li><Link href="/editor" className="hover:underline">Quick Voice Builder</Link></li>
            <li><Link href="/board?project=duet" className="hover:underline">Your Board 3D Inspector</Link></li>
            <li><Link href="/projects" className="hover:underline">Projects Gallery</Link></li>
            <li><Link href="/community" className="hover:underline">Community Hub</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <div className="font-semibold text-zinc-900 dark:text-zinc-200">Verticals</div>
          <ul className="space-y-1.5">
            <li><Link href="/kids" className="hover:underline">Kids &amp; Makers</Link></li>
            <li><Link href="/education" className="hover:underline">Schools &amp; Universities</Link></li>
            <li><Link href="/industry" className="hover:underline">Industry &amp; R&amp;D</Link></li>
            <li><Link href="/hackathons" className="hover:underline">Hackathons</Link></li>
            <li><Link href="/coding-agent-prompt" className="hover:underline">Coding Agent Prompt</Link></li>
            <li><Link href="/mcp" className="hover:underline">MCP Server</Link></li>
          </ul>
        </div>

        <div className="space-y-2">
          <div className="font-semibold text-zinc-900 dark:text-zinc-200">Resources &amp; Legal</div>
          <ul className="space-y-1.5">
            <li><Link href="/docs" className="hover:underline">Documentation</Link></li>
            <li><Link href="/app" className="hover:underline">Companion App</Link></li>
            <li><Link href="/logos" className="hover:underline">Brand &amp; Logos</Link></li>
            <li><Link href="/support" className="hover:underline">Support</Link></li>
            <li>
              <Link href="/terms" className="hover:underline">Terms</Link> ·{' '}
              <Link href="/privacy" className="hover:underline">Privacy</Link> ·{' '}
              <button
                type="button"
                onClick={() => setCookieModalOpen(true)}
                data-testid="footer-cookie-settings-btn"
                className="hover:underline"
              >
                Cookie settings
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Easter-Egg ✦ Beta Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-4">
        <div>© 2026 Atech ApS · Copenhagen, Denmark · All rights reserved.</div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setBetaModalOpen((v) => !v)}
            data-testid="footer-sparkle-beta-btn"
            className="px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300"
            title="Beta test our next platform"
          >
            ✦
          </button>
        </div>
      </div>

      {betaModalOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-3 flex justify-end">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 shadow-lg max-w-sm">
            <div className="font-semibold text-zinc-900 dark:text-white">
              ✦ Beta test our next platform
            </div>
            <p className="mt-1 text-zinc-500">
              Try the live Prompt-to-Product Studio workbench with 63 parts, 3D board placement,
              and browser ESP32-S3 emulation.
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/studio"
                className="rounded-full bg-zinc-900 text-white px-3.5 py-1.5 font-semibold"
              >
                Open Studio →
              </Link>
              <button
                type="button"
                onClick={() => setBetaModalOpen(false)}
                className="rounded-full border border-zinc-300 px-3 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {cookieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            data-testid="cookie-settings-modal"
            className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl text-zinc-900 dark:text-white"
          >
            <h3 className="text-lg font-bold">Cookies on Atech.dev</h3>
            <p className="mt-1 text-xs text-zinc-500">
              We use essential cookies for cart, currency, and Studio authentication, plus optional
              anonymous analytics.
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
                <div>
                  <div className="font-semibold text-xs">Necessary</div>
                  <div className="text-[11px] text-zinc-500">
                    Session, shopping cart, and security tokens
                  </div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-zinc-500">Always on</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
                <div>
                  <div className="font-semibold text-xs">Analytics</div>
                  <div className="text-[11px] text-zinc-500">
                    Anonymous usage telemetry to improve Studio builds
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="h-4 w-4 accent-zinc-900"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAnalyticsEnabled(false);
                  setCookieModalOpen(false);
                }}
                className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold"
              >
                Necessary only
              </button>
              <button
                type="button"
                onClick={() => setCookieModalOpen(false)}
                className="rounded-full bg-zinc-900 text-white px-4 py-2 text-xs font-semibold"
              >
                Save choice
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
