'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HARDWARE_KITS,
  ENRICHED_STORE_MODULES as STORE_MODULES,
  SHOWCASE_DETAILS,
  FAQ_ITEMS,
  STUDIO_SHOWCASES,
  KitDefinition,
} from '@/data/store-data';
import { useApp } from '@/context/AppContext';
import { BoardViewer3D } from '@/components/BoardViewer3D';

export default function HomePage() {
  const { addToCart, formatPrice } = useApp();
  const [try3DKit, setTry3DKit] = useState<KitDefinition | null>(null);
  const [insideKit, setInsideKit] = useState<KitDefinition | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  const handleAdd = (item: {
    slug: string;
    name: string;
    priceEur: number;
    type: 'kit' | 'module';
  }) => {
    addToCart(item);
    setAddedSlug(item.slug);
    setTimeout(() => setAddedSlug((prev) => (prev === item.slug ? null : prev)), 1400);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              MODULAR HARDWARE + AI STUDIO
            </div>
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight leading-[1.05]">
              Build custom electronics with AI.
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              Snap magnetic sensor, display, and control modules onto the 14-port ESP32-S3
              motherboard. Describe what your device should do in plain English and flash
              production C++ firmware in one click.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/studio"
                className="px-6 py-3.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-sm hover:opacity-90 transition shadow-sm"
              >
                Build with AI →
              </Link>
              <a
                href="#kits"
                className="px-6 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              >
                Explore kits ↓
              </a>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <div>
                <div className="font-mono font-bold text-base text-zinc-950 dark:text-white">
                  14 Ports
                </div>
                <div className="text-zinc-500">Zero soldering or wiring</div>
              </div>
              <div>
                <div className="font-mono font-bold text-base text-zinc-950 dark:text-white">
                  21 Modules
                </div>
                <div className="text-zinc-500">Displays, sensors, dials & IO</div>
              </div>
              <div>
                <div className="font-mono font-bold text-base text-zinc-950 dark:text-white">
                  ESP32-S3
                </div>
                <div className="text-zinc-500">Wi-Fi, BLE 5 & WebSerial</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <BoardViewer3D
              title="Interactive 3D Motherboard — Game Console Build"
              placements={STUDIO_SHOWCASES[0]?.placements || []}
              interactive={true}
              heightClass="h-[400px] sm:h-[440px]"
            />
          </div>
        </div>
      </section>

      {/* Built with the Kit Showcase Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
              BUILT WITH THE KIT
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mt-1">
              Seven devices. Same modular blocks.
            </h2>
          </div>
          <Link
            href="/studio"
            className="text-xs font-semibold text-teal-600 hover:underline"
          >
            Open any build in AI Studio →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHOWCASE_DETAILS.map((item) => (
            <Link
              key={item.slug}
              href={`/b/${item.slug}`}
              className="group rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 hover:border-teal-500/60 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 mb-2">
                  <span>{item.modules.length} MODULES</span>
                  <span className="text-teal-600 group-hover:translate-x-0.5 transition">
                    Inspect →
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{item.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-1 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                {item.modules.map((m, idx) => (
                  <span
                    key={`${m.slug}-${idx}`}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-300"
                  >
                    {m.qty > 1 ? `${m.qty}× ` : ''}
                    {m.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hardware Kits Section */}
      <section id="kits" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
            STARTER & PRO BUNDLES
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold">Choose your kit</h2>
          <p className="text-sm text-zinc-500">
            Every kit includes the 14-port ESP32-S3 motherboard, rechargeable battery, USB-C
            cable, and unlimited access to the AI Firmware Studio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {HARDWARE_KITS.map((kit) => (
            <div
              key={kit.slug}
              data-testid={`kit-card-${kit.slug}`}
              className={`rounded-3xl bg-white dark:bg-zinc-900 border p-6 sm:p-8 flex flex-col justify-between relative ${
                kit.badge
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-lg'
                  : 'border-zinc-200 dark:border-zinc-800 shadow-xs'
              }`}
            >
              {kit.badge && (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-teal-600 text-white text-[10px] font-mono uppercase tracking-wider font-bold">
                  {kit.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-display font-bold">{kit.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{kit.tagline}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-bold">
                    {formatPrice(kit.priceEur)}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {kit.moduleCount} modules included
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {kit.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Included modules
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {kit.modules.slice(0, 8).map((m) => (
                      <span
                        key={m.slug}
                        className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium"
                      >
                        {m.qty}× {m.name}
                      </span>
                    ))}
                    {kit.modules.length > 8 && (
                      <span className="px-2 py-1 rounded-lg bg-teal-500/10 text-teal-600 text-[11px] font-mono">
                        +{kit.modules.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() =>
                    handleAdd({
                      slug: kit.slug,
                      name: kit.name,
                      priceEur: kit.priceEur,
                      type: 'kit',
                    })
                  }
                  data-testid={`add-kit-${kit.slug}`}
                  className="w-full py-3 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs hover:opacity-90 transition"
                >
                  {addedSlug === kit.slug
                    ? '✓ Added to Cart'
                    : `Add ${kit.name} — ${formatPrice(kit.priceEur)}`}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTry3DKit(kit)}
                    data-testid={`try-3d-${kit.slug}`}
                    className="py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Try it in 3D
                  </button>
                  <button
                    onClick={() => setInsideKit(kit)}
                    data-testid={`inside-kit-${kit.slug}`}
                    className="py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    See what&apos;s inside
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 21 Individual Modules Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
              EXPAND YOUR KIT
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mt-1">
              21 Snap-In Hardware Modules
            </h2>
          </div>
          <Link
            href="/modules"
            className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Browse all 21 modules →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {STORE_MODULES.slice(0, 8).map((mod) => (
            <div
              key={mod.slug}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
                  <span>{mod.category}</span>
                  <span>{mod.pins}</span>
                </div>
                <Link
                  href={`/modules/${mod.slug}`}
                  className="font-display font-bold text-base hover:text-teal-600 transition"
                >
                  {mod.name}
                </Link>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{mod.tagline}</p>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="font-mono font-bold text-sm">
                  {formatPrice(mod.priceEur)}
                </span>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/modules/${mod.slug}`}
                    className="px-2.5 py-1 rounded-full text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Specs
                  </Link>
                  <button
                    onClick={() =>
                      handleAdd({
                        slug: mod.slug,
                        name: mod.name,
                        priceEur: mod.priceEur,
                        type: 'module',
                      })
                    }
                    className="px-3 py-1 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
                  >
                    {addedSlug === mod.slug ? '✓ Added' : '+ Add'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verticals Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              href: '/kids',
              tag: 'FOR KIDS & FAMILIES',
              title: 'Safe, solderless invention',
              desc: 'Build real games, alarms, and gadgets in 10 minutes with zero exposed wiring.',
            },
            {
              href: '/education',
              tag: 'FOR SCHOOLS & LABS',
              title: 'Classroom 10-Pack & Curriculum',
              desc: 'Reusable magnetic kits for STEM, physics, and embedded C++ courses.',
            },
            {
              href: '/industry',
              tag: 'FOR R&D TEAMS',
              title: 'Rapid hardware validation',
              desc: 'Prototype human-machine interfaces and sensor telemetry before spinning PCBs.',
            },
            {
              href: '/hackathons',
              tag: 'FOR HACKATHONS',
              title: 'Hardware tracks that ship',
              desc: 'Teams go from idea to working hardware demo in under 24 hours.',
            },
          ].map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="rounded-2xl bg-zinc-900 text-white p-6 hover:bg-zinc-800 transition flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-mono tracking-widest text-teal-400 mb-2">
                  {v.tag}
                </div>
                <h3 className="font-display font-bold text-lg mb-1.5">{v.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{v.desc}</p>
              </div>
              <div className="text-xs font-semibold text-teal-400 mt-4">Explore →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-teal-600">FAQ</div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold mt-1">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-2.5">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={item.q}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm"
              >
                <span>{item.q}</span>
                <span className="text-zinc-400 font-mono text-base">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Try in 3D Modal */}
      {try3DKit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-teal-600 uppercase">
                  INTERACTIVE 3D PREVIEW
                </div>
                <h3 className="text-xl font-display font-bold">
                  {try3DKit.name} — {formatPrice(try3DKit.priceEur)}
                </h3>
              </div>
              <button
                onClick={() => setTry3DKit(null)}
                className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold"
              >
                Close ✕
              </button>
            </div>

            <BoardViewer3D
              title={`${try3DKit.name} Sample Assembly`}
              placements={STUDIO_SHOWCASES[0]?.placements || []}
              interactive={true}
              heightClass="h-[380px]"
            />

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/studio"
                className="text-xs font-semibold text-teal-600 hover:underline"
              >
                Customize in full AI Studio →
              </Link>
              <button
                onClick={() => {
                  handleAdd({
                    slug: try3DKit.slug,
                    name: try3DKit.name,
                    priceEur: try3DKit.priceEur,
                    type: 'kit',
                  });
                  setTry3DKit(null);
                }}
                className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
              >
                Add {try3DKit.name} to Cart ({formatPrice(try3DKit.priceEur)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* See What's Inside Modal */}
      {insideKit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-teal-600 uppercase">
                  BOX CONTENTS & BILL OF MATERIALS
                </div>
                <h3 className="text-xl font-display font-bold">
                  What&apos;s inside the {insideKit.name}
                </h3>
              </div>
              <button
                onClick={() => setInsideKit(null)}
                className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold"
              >
                Close ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold">
                  1× Atech 14-Port ESP32-S3 Motherboard + LiPo Battery + USB-C Cable
                </span>
                <span className="font-mono text-teal-600">Included</span>
              </div>
              {insideKit.modules.map((m) => (
                <div
                  key={m.slug}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <span>
                    <strong className="font-mono">{m.qty}×</strong> {m.name}
                  </span>
                  <Link
                    href={`/modules/${m.slug}`}
                    onClick={() => setInsideKit(null)}
                    className="text-zinc-400 hover:text-teal-600 font-mono"
                  >
                    View module →
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-zinc-500">
                Total bundle price:{' '}
                <strong className="text-zinc-950 dark:text-white font-mono">
                  {formatPrice(insideKit.priceEur)}
                </strong>
              </div>
              <button
                onClick={() => {
                  handleAdd({
                    slug: insideKit.slug,
                    name: insideKit.name,
                    priceEur: insideKit.priceEur,
                    type: 'kit',
                  });
                  setInsideKit(null);
                }}
                className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
