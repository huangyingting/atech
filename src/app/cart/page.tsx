'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { HARDWARE_KITS } from '@/data/store-data';

export default function CartPage() {
  const {
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
    currency,
    user,
  } = useApp();

  const [email, setEmail] = useState(user?.email || '');
  const [shippingName, setShippingName] = useState(user?.displayName || '');
  const [country, setCountry] = useState('United States');
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    id: string;
    totalFormatted: string;
  } | null>(null);

  const subtotalEur = cart.reduce((acc, item) => acc + item.priceEur * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          shippingName,
          country,
          currency,
          items: cart,
        }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrderConfirmation({
          id: data.order.id,
          totalFormatted: formatPrice(subtotalEur),
        });
        clearCart();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (orderConfirmation) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h1 className="text-3xl font-display font-bold">Order Confirmed</h1>
        <p className="text-xs text-zinc-500">
          Order ID <code className="font-mono text-zinc-800 dark:text-zinc-200">{orderConfirmation.id}</code>{' '}
          ({orderConfirmation.totalFormatted}) has been recorded. While your hardware ships,
          you can design and test your device in the AI Firmware Studio.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/studio"
            className="px-5 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
          >
            Launch AI Studio →
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
          >
            Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-teal-600">
          HARDWARE BAG
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">Your Cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-10 text-center space-y-6">
          <p className="text-sm text-zinc-500">Your hardware bag is currently empty.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {HARDWARE_KITS.map((kit) => (
              <button
                key={kit.slug}
                onClick={() =>
                  addToCart({
                    slug: kit.slug,
                    name: kit.name,
                    priceEur: kit.priceEur,
                    type: 'kit',
                  })
                }
                className="px-4 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold"
              >
                + Add {kit.name} ({formatPrice(kit.priceEur)})
              </button>
            ))}
          </div>
          <div>
            <Link href="/modules" className="text-xs text-teal-600 hover:underline font-medium">
              Or browse all 21 individual modules →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-3">
            {cart.map((item) => (
              <div
                key={item.slug}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-[10px] font-mono uppercase text-zinc-400">
                    {item.type}
                  </div>
                  <div className="font-display font-bold text-base">{item.name}</div>
                  <div className="text-xs font-mono text-zinc-500">
                    {formatPrice(item.priceEur)} each
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-full">
                    <button
                      onClick={() => updateCartQuantity(item.slug, item.quantity - 1)}
                      className="px-3 py-1 text-xs font-mono"
                    >
                      −
                    </button>
                    <span className="px-2 text-xs font-mono font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.slug, item.quantity + 1)}
                      className="px-3 py-1 text-xs font-mono"
                    >
                      +
                    </button>
                  </div>
                  <div className="w-20 text-right font-mono font-bold text-sm">
                    {formatPrice(item.priceEur * item.quantity)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.slug)}
                    className="text-xs text-zinc-400 hover:text-rose-500"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCheckout}
            className="lg:col-span-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 h-fit"
          >
            <h2 className="text-lg font-display font-bold">Order Summary</h2>
            <div className="space-y-2 text-xs border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-mono font-semibold">{formatPrice(subtotalEur)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Worldwide Express Shipping</span>
                <span className="font-mono text-teal-600">Free</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold">Total ({currency})</span>
              <span className="text-2xl font-mono font-bold">
                {formatPrice(subtotalEur)}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Email for tracking</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Shipping Country</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs hover:opacity-90 transition"
            >
              {submitting ? 'Processing Order...' : `Place Order — ${formatPrice(subtotalEur)}`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
