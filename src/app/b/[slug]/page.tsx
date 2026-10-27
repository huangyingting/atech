'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SHOWCASE_DETAILS, HARDWARE_KITS, STUDIO_SHOWCASES } from '@/data/store-data';
import { BoardViewer3D } from '@/components/BoardViewer3D';
import { useApp } from '@/context/AppContext';

export default function ShowcaseDetailPage() {
  const params = useParams<{ slug: string }>();
  const { addToCart, formatPrice } = useApp();

  const detail = SHOWCASE_DETAILS.find((s) => s.slug === params.slug);
  const studioShowcase = STUDIO_SHOWCASES.find((s) => s.id === params.slug);

  if (!detail) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-display font-bold">Showcase build not found</h1>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-full bg-zinc-950 text-white text-xs font-semibold"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
        <Link href="/" className="hover:text-teal-600">
          ← Built with the Kit
        </Link>
        <span>SHOWCASE BUILD / {detail.slug.toUpperCase()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-4">
          <BoardViewer3D
            title={`${detail.title} — Interactive 3D & Hardware Emulator`}
            placements={
              (studioShowcase?.placements as Array<{
                instance_id: string;
                part_id: string;
                slot: string;
                rotation_deg?: number;
              }>) || []
            }
            interactive={true}
            heightClass="h-[420px]"
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
              REFERENCE DESIGN
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
              {detail.title}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">{detail.tagline}</p>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {detail.description}
          </p>

          <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-zinc-400">
              AI STUDIO PROMPT
            </div>
            <p className="text-xs font-mono text-zinc-800 dark:text-zinc-200">
              &ldquo;{detail.prompt}&rdquo;
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase text-zinc-400">
              Modules used ({detail.modules.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {detail.modules.map((m) => (
                <Link
                  key={m.slug}
                  href={`/modules/${m.slug}`}
                  className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between hover:border-teal-500"
                >
                  <span>
                    <strong className="font-mono">{m.qty}×</strong> {m.name}
                  </span>
                  <span className="text-zinc-400">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/studio?showcase=${detail.slug}`}
              className="flex-1 py-3 px-5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-center font-semibold text-xs"
            >
              Open & Customize in AI Studio →
            </Link>
            <button
              onClick={() =>
                addToCart({
                  slug: HARDWARE_KITS[1].slug,
                  name: HARDWARE_KITS[1].name,
                  priceEur: HARDWARE_KITS[1].priceEur,
                  type: 'kit',
                })
              }
              className="py-3 px-5 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Buy Big Kit ({formatPrice(HARDWARE_KITS[1].priceEur)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
