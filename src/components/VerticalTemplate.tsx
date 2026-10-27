'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HARDWARE_KITS } from '@/data/store-data';
import { useApp } from '@/context/AppContext';

export function VerticalTemplate({
  vertical,
  badge,
  title,
  subtitle,
  highlights,
  ctaLabel,
}: {
  vertical: string;
  badge: string;
  title: string;
  subtitle: string;
  highlights: { heading: string; body: string }[];
  ctaLabel: string;
}) {
  const { addToCart, formatPrice } = useApp();
  const [organization, setOrganization] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vertical,
        organization,
        contactName,
        email,
        quantity,
        notes,
      }),
    });
    if (res.ok) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
            {badge}
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold leading-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 leading-relaxed">{subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {highlights.map((h) => (
              <div
                key={h.heading}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-1.5"
              >
                <h3 className="font-display font-bold text-base">{h.heading}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() =>
                addToCart({
                  slug: HARDWARE_KITS[1].slug,
                  name: HARDWARE_KITS[1].name,
                  priceEur: HARDWARE_KITS[1].priceEur,
                  type: 'kit',
                })
              }
              className="px-6 py-3 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
            >
              {ctaLabel} — {formatPrice(HARDWARE_KITS[1].priceEur)}
            </button>
            <Link
              href="/studio"
              className="px-6 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
            >
              Try AI Studio →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-4">
          <div className="text-xs font-mono uppercase text-teal-600">
            VOLUME & INSTITUTIONAL DEPLOYMENT
          </div>
          <h2 className="text-xl font-display font-bold">Request a Pack or Quote</h2>
          {submitted ? (
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-700 dark:text-teal-300">
              ✓ Inquiry recorded. Our hardware deployment team will follow up within 1
              business day.
            </div>
          ) : (
            <form onSubmit={handleInquiry} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Organization / School</label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="MIT Media Lab / Acme Corp"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kit Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Project / Event Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
