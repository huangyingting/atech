'use client';

import React, { useState } from 'react';
import { FAQ_ITEMS } from '@/data/store-data';

export default function SupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Hardware & Modules');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, topic, message }),
    });
    if (res.ok) setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
          CUSTOMER & ENGINEERING SUPPORT
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold mt-1">
          How can we help?
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-display font-bold">Send a Support Ticket</h2>
          {sent ? (
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-700 dark:text-teal-300">
              ✓ Support ticket logged. Our hardware engineers will reply via email shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  <option>Hardware & Modules</option>
                  <option>AI Studio & Firmware Flashing</option>
                  <option>Order & Shipping Status</option>
                  <option>Invite Codes & Account</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold"
              >
                Submit Support Request
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-6 space-y-3">
          <h2 className="text-xl font-display font-bold">Common Questions</h2>
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-1"
            >
              <div className="font-semibold text-xs">{item.q}</div>
              <p className="text-xs text-zinc-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
