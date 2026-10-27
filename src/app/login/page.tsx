'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { setSessionFromPayload } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountType, setAccountType] = useState<'hobbyist' | 'student' | 'teacher' | 'industry'>('hobbyist');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = tab === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
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
        setError(data.error || 'Authentication failed.');
        setLoading(false);
        return;
      }
      setSessionFromPayload(data);
      await signIn('credentials', { email, password, redirect: false }).catch(() => null);
      router.push('/studio');
    } catch {
      setError('Network error while authenticating.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-1">
            Atech Identity & Access
          </div>
          <h1 className="text-2xl font-display font-bold">
            {tab === 'login' ? 'Sign in to Atech' : 'Invite-Only Registration'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {tab === 'login'
              ? 'Access your Studio projects, firmware builds, and account credits.'
              : 'Redeem a single-use or expiring invitation code to create your account.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setTab('login');
            }}
            className={`py-2 rounded-full ${
              tab === 'login'
                ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setTab('register');
            }}
            className={`py-2 rounded-full ${
              tab === 'register'
                ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            Redeem Invite Code
          </button>
        </div>

        {error && (
          <div
            data-testid="login-page-error"
            className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Invitation Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="ATECH-XXXX-XXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-sm uppercase"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@domain.com"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
            />
          </div>

          {tab === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Persona</label>
                <select
                  value={accountType}
                  onChange={(e) =>
                    setAccountType(
                      e.target.value as 'hobbyist' | 'student' | 'teacher' | 'industry'
                    )
                  }
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
            disabled={loading}
            className="w-full py-3 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-sm hover:opacity-90 transition"
          >
            {loading
              ? 'Processing...'
              : tab === 'register'
              ? 'Redeem Invite & Create Account'
              : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
