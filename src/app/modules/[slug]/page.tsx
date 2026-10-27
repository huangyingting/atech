'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ENRICHED_STORE_MODULES as STORE_MODULES } from '@/data/store-data';
import { useApp } from '@/context/AppContext';
import { BoardViewer3D } from '@/components/BoardViewer3D';

export default function ModuleDetailPage() {
  const params = useParams<{ slug: string }>();
  const { addToCart, formatPrice } = useApp();
  const [added, setAdded] = useState(false);

  const mod = STORE_MODULES.find((m) => m.slug === params.slug);

  if (!mod) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-display font-bold">Module not found</h1>
        <Link
          href="/modules"
          className="inline-block px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-semibold"
        >
          ← Back to all 21 modules
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-xs font-mono text-zinc-500">
        <Link href="/modules" className="hover:text-teal-600">
          ← All 21 Modules
        </Link>{' '}
        / <span className="text-zinc-900 dark:text-white">{mod.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7">
          <BoardViewer3D
            title={`${mod.name} — Interactive Module Preview`}
            placements={[
              {
                instance_id: `${mod.slug}_1`,
                part_id: mod.slug.replace(/-/g, '_'),
                slot: 'S3',
                rotation_deg: 0,
              },
            ]}
            interactive={true}
            heightClass="h-[380px]"
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
              {mod.category}
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">{mod.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">{mod.tagline}</p>
          </div>

          <div className="text-3xl font-mono font-bold">{formatPrice(mod.priceEur)}</div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {mod.description}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                addToCart({
                  slug: mod.slug,
                  name: mod.name,
                  priceEur: mod.priceEur,
                  type: 'module',
                });
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
              className="flex-1 py-3 px-6 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs"
            >
              {added ? '✓ Added to Cart' : `Add to Cart — ${formatPrice(mod.priceEur)}`}
            </button>
            <Link
              href={`/studio?prompt=${encodeURIComponent(`Build a device using the ${mod.name} module`)}`}
              className="py-3 px-5 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Try in AI Studio →
            </Link>
          </div>

          {/* Hardware Specs */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-2 text-xs">
            <div className="font-mono uppercase text-[10px] text-zinc-400 tracking-wider">
              TECHNICAL SPECIFICATIONS
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Bus / Interface</span>
              <span className="font-mono">{mod.pins}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Dimensions</span>
              <span className="font-mono">{mod.footprint}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Included in Kits</span>
              <span className="font-mono">
                {mod.includedIn.map((k) => `${k.qty}× in ${k.kit}`).join(', ')}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-zinc-400">Highlights</div>
            <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              {mod.specs.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="text-teal-500">●</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
