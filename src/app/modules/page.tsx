'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ENRICHED_STORE_MODULES as STORE_MODULES, HARDWARE_KITS } from '@/data/store-data';
import { useApp } from '@/context/AppContext';

export default function ModulesCatalogPage() {
  const { addToCart, formatPrice } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  const categories = ['ALL', ...Array.from(new Set(STORE_MODULES.map((m) => m.category)))];

  const filtered = STORE_MODULES.filter((mod) => {
    const matchesCat = selectedCategory === 'ALL' || mod.category === selectedCategory;
    const matchesSearch =
      !search ||
      mod.name.toLowerCase().includes(search.toLowerCase()) ||
      mod.tagline.toLowerCase().includes(search.toLowerCase()) ||
      mod.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAdd = (slug: string, name: string, priceEur: number, type: 'kit' | 'module') => {
    addToCart({ slug, name, priceEur, type });
    setAddedSlug(slug);
    setTimeout(() => setAddedSlug((prev) => (prev === slug ? null : prev)), 1300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
            MODULAR HARDWARE CATALOG
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold mt-1">
            All 21 Snap-In Modules
          </h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-xl">
            Every module connects to any of the 14 reversible pogo-pin ports on the Atech
            motherboard. Auto-discovered over I²C/SPI/GPIO by the AI Firmware Studio.
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search 21 modules..."
          className="px-4 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs w-full sm:w-64"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition ${
              selectedCategory === cat
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 21 Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((mod) => (
          <div
            key={mod.slug}
            data-testid={`module-card-${mod.slug}`}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between hover:border-teal-500/60 transition"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
                <span>{mod.category}</span>
                <span>{mod.footprint}</span>
              </div>
              <Link
                href={`/modules/${mod.slug}`}
                className="font-display font-bold text-lg hover:text-teal-600 transition block"
              >
                {mod.name}
              </Link>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{mod.tagline}</p>

              <div className="mt-3 flex flex-wrap gap-1">
                {mod.includedIn.map((inc) => (
                  <span
                    key={inc.kit}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500"
                  >
                    {inc.qty}× in {inc.kit}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-5 border-t border-zinc-100 dark:border-zinc-800">
              <span className="font-mono font-bold text-base">
                {formatPrice(mod.priceEur)}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/modules/${mod.slug}`}
                  className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Details
                </Link>
                <button
                  onClick={() => handleAdd(mod.slug, mod.name, mod.priceEur, 'module')}
                  className="px-3.5 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
                >
                  {addedSlug === mod.slug ? '✓ Added' : '+ Add'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bundle Upsell Banner */}
      <div className="rounded-3xl bg-zinc-900 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-mono text-teal-400 uppercase">SAVE UP TO 35%</div>
          <h2 className="text-2xl font-display font-bold">
            Get the Big Kit with 15 modules + motherboard
          </h2>
          <p className="text-xs text-zinc-400">
            Includes OLED display, 5 buttons, 2 rotary dials, IMU, environment sensor, buzzer,
            and RGB LEDs.
          </p>
        </div>
        <button
          onClick={() =>
            handleAdd(
              HARDWARE_KITS[1].slug,
              HARDWARE_KITS[1].name,
              HARDWARE_KITS[1].priceEur,
              'kit'
            )
          }
          className="px-6 py-3 rounded-full bg-teal-500 text-zinc-950 font-semibold text-xs shrink-0 hover:bg-teal-400 transition"
        >
          Add Big Kit — {formatPrice(HARDWARE_KITS[1].priceEur)}
        </button>
      </div>
    </div>
  );
}
