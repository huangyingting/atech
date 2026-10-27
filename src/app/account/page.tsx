'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AccountSettingsPage() {
  const router = useRouter();
  const {
    user,
    authHeaders,
    refreshUser,
    logout,
    openAuthModal,
    theme,
    setTheme,
    accent,
    setAccent,
  } = useApp();

  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [accountType, setAccountType] = useState('hobbyist');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [defaultEditorMode, setDefaultEditorMode] = useState<'simple' | 'advanced'>('simple');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || '');
    setHandle(user.handle || '');
    setBio(user.bio || '');
    setAccountType(user.accountType || 'hobbyist');
    setLocation(user.location || '');
    setWebsite(user.website || '');
    setGithub(user.github || '');
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-display font-bold">Account Settings</h1>
        <p className="text-xs text-zinc-500">
          Sign in with your invite-verified Atech account to manage your profile, credits,
          and appearance preferences.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
        >
          Sign in
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        displayName,
        handle,
        bio,
        accountType,
        location,
        website,
        github,
        theme,
        accent,
        preferences: { defaultEditorMode },
      }),
    });
    if (res.ok) {
      await refreshUser();
      setSavedNotice('✓ Account settings saved');
      setTimeout(() => setSavedNotice(null), 2000);
    }
  };

  const handleTopUpCredits = async () => {
    const res = await fetch('/api/account/credits', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ amount: 50 }),
    });
    if (res.ok) {
      await refreshUser();
      setSavedNotice('✓ Added 50 Studio synthesis credits');
      setTimeout(() => setSavedNotice(null), 2000);
    }
  };

  const handleDeleteAccount = async () => {
    const res = await fetch('/api/account', {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await logout();
      router.push('/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
            STUDIO ACCOUNT & PREFERENCES
          </div>
          <h1 className="text-3xl font-display font-bold mt-1">
            {user.displayName || user.email}
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Role: {user.role} • Status: {user.status} • Invite Redeemed:{' '}
            {user.invitedByCode || 'BOOTSTRAP'}
          </p>
        </div>
        {savedNotice && (
          <span className="px-3.5 py-1.5 rounded-full bg-teal-500/15 text-teal-600 text-xs font-semibold">
            {savedNotice}
          </span>
        )}
      </div>

      {/* 1. Profile & Persona */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4"
      >
        <h2 className="text-lg font-display font-bold">1. Profile & Engineering Persona</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Display Name</label>
            <input
              type="text"
              data-testid="account-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Community Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Persona Badge</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            >
              <option value="hobbyist">Hobbyist (H)</option>
              <option value="student">Student (S)</option>
              <option value="teacher">Teacher (T)</option>
              <option value="industry">Industry (I)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Zurich / San Francisco"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">GitHub Username</label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="@username"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
            />
          </div>
        </div>
        <div className="text-xs">
          <label className="block font-semibold mb-1">Bio</label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
          />
        </div>
        <button
          type="submit"
          data-testid="save-account-btn"
          className="px-5 py-2 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
        >
          Save Profile Changes
        </button>
      </form>

      {/* 2. Plan & AI Synthesis Credits */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-bold">2. Plan & AI Synthesis Credits</h2>
            <p className="text-xs text-zinc-500">
              Current Plan: <strong className="uppercase font-mono">{user.plan}</strong> •{' '}
              <span className="font-mono">
                {user.creditsRemaining} / {user.creditsMonthlyLimit}
              </span>{' '}
              credits available
            </p>
          </div>
          <button
            type="button"
            onClick={handleTopUpCredits}
            data-testid="topup-credits-btn"
            className="px-4 py-2 rounded-full bg-teal-600 text-white text-xs font-semibold"
          >
            + Add 50 Credits
          </button>
        </div>
        <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  ((user.creditsRemaining ?? 100) /
                    Math.max(1, user.creditsMonthlyLimit ?? 100)) *
                    100
                )
              )}%`,
            }}
          />
        </div>
      </div>

      {/* 3. Appearance: Theme & 6 Accents */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="text-lg font-display font-bold">3. Appearance & Accent Palette</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="font-semibold mb-2">Theme Mode</div>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  data-testid={`theme-${t}`}
                  className={`px-4 py-2 rounded-full capitalize font-medium ${
                    theme === t
                      ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold'
                      : 'border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Studio Accent Swatch</div>
            <div className="flex flex-wrap gap-2">
              {(
                ['aurora', 'ember', 'moss', 'ocean', 'violet', 'mono'] as const
              ).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAccent(a)}
                  data-testid={`accent-${a}`}
                  className={`px-3 py-1.5 rounded-full capitalize font-mono text-[11px] ${
                    accent === a
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Editor Defaults & Data Portability */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="text-lg font-display font-bold">
          4. Studio Defaults, Privacy & Data Export
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-semibold">Default Project Editor Complexity</div>
            <div className="text-zinc-500">
              Choose whether new builds open in Simple or Advanced 14-Port mode.
            </div>
          </div>
          <div className="flex gap-2">
            {(['simple', 'advanced'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDefaultEditorMode(m)}
                className={`px-3.5 py-1.5 rounded-full capitalize ${
                  defaultEditorMode === m
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold'
                    : 'border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <a
            href="/api/account/export"
            download
            className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Download Full Account & Projects JSON Archive
          </a>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-full border border-rose-300 dark:border-rose-800 text-rose-600 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
