'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { formatPriceUsd, REGIONAL_CURRENCIES } from '@/data/store-data';

export interface AuthUser {
  id: string;
  email: string;
  display_name?: string | null;
  displayName?: string | null;
  role: string;
  account_type?: string | null;
  accountType?: string | null;
  handle?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  github?: string | null;
  status?: string;
  invitedByCode?: string | null;
  plan?: string;
  creditsRemaining?: number;
  creditsMonthlyLimit?: number;
}

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  priceUsd: number;
  priceEur: number;
  qty: number;
  quantity: number;
  kind: 'kit' | 'module';
  type: 'kit' | 'module';
}

export type AddCartItemInput = {
  id?: string;
  slug: string;
  name: string;
  priceUsd?: number;
  priceEur?: number;
  kind?: 'kit' | 'module';
  type?: 'kit' | 'module';
};

interface AppContextValue {
  user: AuthUser | null;
  token: string | null;
  authLoading: boolean;
  countryCode: string;
  currency: string;
  setCountryCode: (code: string) => void;
  formatPrice: (usd: number) => string;
  cart: CartItem[];
  addToCart: (item: AddCartItemInput, qty?: number) => void;
  updateCartQty: (id: string, qty: number) => void;
  updateCartQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotalUsd: number;
  themeMode: 'light' | 'dark' | 'system';
  theme: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
  accentColor: 'aurora' | 'ember' | 'moss' | 'ocean' | 'violet' | 'mono';
  accent: 'aurora' | 'ember' | 'moss' | 'ocean' | 'violet' | 'mono';
  setAccentColor: (accent: 'aurora' | 'ember' | 'moss' | 'ocean' | 'violet' | 'mono') => void;
  setAccent: (accent: 'aurora' | 'ember' | 'moss' | 'ocean' | 'violet' | 'mono') => void;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setSessionFromPayload: (payload: { access_token: string; user: AuthUser }) => void;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  recordAnonProject: (projectId: string) => void;
  getAnonProjects: () => string[];
  authHeaders: () => Record<string, string>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const K_TOKEN = 'p2p_auth_token';
const K_USER = 'p2p_auth_user';
const K_EXP = 'p2p_auth_exp';
const K_ANON = 'p2p_anon_projects';
const K_CART = 'atech_cart_items_v1';
const K_COUNTRY = 'atech_country';
const K_THEME = 'atech_theme_mode';
const K_ACCENT = 'atech_accent_color';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [countryCode, setCountryCodeState] = useState('US');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('light');
  const [accentColor, setAccentColorState] = useState<
    'aurora' | 'ember' | 'moss' | 'ocean' | 'violet' | 'mono'
  >('aurora');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const applyThemeAndAccent = useCallback(
    (mode: 'light' | 'dark' | 'system', accent: string) => {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;
      const effectiveDark =
        mode === 'dark' ||
        (mode === 'system' &&
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.setAttribute('data-theme', effectiveDark ? 'dark' : 'light');
      root.classList.toggle('dark', effectiveDark);
      root.setAttribute('data-accent', accent);
    },
    []
  );

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(K_TOKEN);
      const savedUserRaw = localStorage.getItem(K_USER);
      if (savedToken && savedUserRaw) {
        const parsedUser = JSON.parse(savedUserRaw) as AuthUser;
        if (parsedUser && parsedUser.id) {
          setToken(savedToken);
          setUser(parsedUser);
        }
      }

      const savedCountry = localStorage.getItem(K_COUNTRY);
      if (savedCountry && REGIONAL_CURRENCIES.some((c) => c.countryCode === savedCountry)) {
        setCountryCodeState(savedCountry);
      }

      const savedCart = localStorage.getItem(K_CART);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) setCart(parsedCart);
      }

      const savedTheme = localStorage.getItem(K_THEME) as 'light' | 'dark' | 'system' | null;
      const savedAccent = localStorage.getItem(K_ACCENT) as
        | 'aurora'
        | 'ember'
        | 'moss'
        | 'ocean'
        | 'violet'
        | 'mono'
        | null;
      const initialTheme = savedTheme || 'light';
      const initialAccent = savedAccent || 'aurora';
      setThemeModeState(initialTheme);
      setAccentColorState(initialAccent);
      applyThemeAndAccent(initialTheme, initialAccent);
    } catch {
      // ignore storage errors
    } finally {
      setAuthLoading(false);
    }
  }, [applyThemeAndAccent]);

  // Verify token against /api/auth/me in background
  const refreshUser = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem(K_TOKEN);
      const headers: Record<string, string> = {};
      if (currentToken) headers.Authorization = `Bearer ${currentToken}`;
      const res = await fetch('/api/auth/me', { headers });
      if (res.ok) {
        const data = await res.json();
        const u = data.user || data;
        const updatedUser: AuthUser = {
          id: u.id,
          email: u.email,
          display_name: u.display_name ?? u.displayName ?? null,
          displayName: u.displayName ?? u.display_name ?? null,
          role: u.role || 'USER',
          account_type: u.account_type ?? u.accountType ?? 'hobbyist',
          accountType: u.accountType ?? u.account_type ?? 'hobbyist',
          handle: u.handle ?? null,
          bio: u.bio ?? null,
          location: u.location ?? null,
          website: u.website ?? null,
          github: u.github ?? null,
          status: u.status ?? 'ACTIVE',
          invitedByCode: u.invitedByCode ?? null,
          plan: u.plan ?? 'free',
          creditsRemaining: u.creditsRemaining ?? 100,
          creditsMonthlyLimit: u.creditsMonthlyLimit ?? 100,
        };
        setUser(updatedUser);
        localStorage.setItem(K_USER, JSON.stringify(updatedUser));
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(K_TOKEN);
        localStorage.removeItem(K_USER);
        localStorage.removeItem(K_EXP);
        setToken(null);
        setUser(null);
      }
    } catch {
      // keep optimistic session on network hiccup
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token, refreshUser]);

  const setSessionFromPayload = useCallback(
    (payload: { access_token: string; user: AuthUser }) => {
      setToken(payload.access_token);
      setUser(payload.user);
      try {
        localStorage.setItem(K_TOKEN, payload.access_token);
        localStorage.setItem(K_USER, JSON.stringify(payload.user));
        localStorage.setItem(K_EXP, String(Math.floor(Date.now() / 1000) + 86400));

        // Claim any anonymous projects created in this browser
        const anonRaw = localStorage.getItem(K_ANON);
        if (anonRaw) {
          const anonIds = JSON.parse(anonRaw) as string[];
          if (Array.isArray(anonIds) && anonIds.length > 0) {
            Promise.all(
              anonIds.map((pid) =>
                fetch(`/api/projects/${pid}/claim`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${payload.access_token}` },
                }).catch(() => null)
              )
            ).then(() => {
              localStorage.removeItem(K_ANON);
            });
          }
        }
      } catch {
        // ignore
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(K_TOKEN);
      localStorage.removeItem(K_USER);
      localStorage.removeItem(K_EXP);
      await fetch('/api/auth/signout', { method: 'POST' }).catch(() => null);
    } catch {
      // ignore
    }
  }, []);

  const setCountryCode = useCallback((code: string) => {
    setCountryCodeState(code);
    try {
      localStorage.setItem(K_COUNTRY, code);
      document.cookie = `atech_country=${code}; path=/; max-age=31536000`;
    } catch {
      // ignore
    }
  }, []);

  const formatPrice = useCallback(
    (usd: number) => formatPriceUsd(usd, countryCode),
    [countryCode]
  );

  const persistCart = useCallback((nextCart: CartItem[]) => {
    setCart(nextCart);
    try {
      localStorage.setItem(K_CART, JSON.stringify(nextCart));
      const total = nextCart.reduce((s, item) => s + item.qty, 0);
      document.cookie = `atech_cart_count=${total}; path=/; max-age=31536000`;
    } catch {
      // ignore
    }
  }, []);

  const addToCart = useCallback(
    (item: AddCartItemInput, qty = 1) => {
      const normalizedId = item.id || item.slug;
      const normalizedPrice = item.priceUsd ?? item.priceEur ?? 15;
      const normalizedKind = item.kind || item.type || 'module';
      setCart((prev) => {
        const existingIdx = prev.findIndex(
          (x) => x.id === normalizedId || x.slug === item.slug
        );
        let next: CartItem[];
        if (existingIdx >= 0) {
          next = prev.map((x, idx) =>
            idx === existingIdx
              ? { ...x, qty: x.qty + qty, quantity: (x.quantity || x.qty) + qty }
              : x
          );
        } else {
          next = [
            ...prev,
            {
              id: normalizedId,
              slug: item.slug,
              name: item.name,
              priceUsd: normalizedPrice,
              priceEur: normalizedPrice,
              qty,
              quantity: qty,
              kind: normalizedKind,
              type: normalizedKind,
            },
          ];
        }
        try {
          localStorage.setItem(K_CART, JSON.stringify(next));
          const total = next.reduce((s, i) => s + i.qty, 0);
          document.cookie = `atech_cart_count=${total}; path=/; max-age=31536000`;
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const updateCartQty = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        persistCart(cart.filter((x) => x.id !== id && x.slug !== id));
      } else {
        persistCart(
          cart.map((x) =>
            x.id === id || x.slug === id ? { ...x, qty, quantity: qty } : x
          )
        );
      }
    },
    [cart, persistCart]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      persistCart(cart.filter((x) => x.id !== id && x.slug !== id));
    },
    [cart, persistCart]
  );

  const clearCart = useCallback(() => {
    persistCart([]);
  }, [persistCart]);

  const setThemeMode = useCallback(
    (mode: 'light' | 'dark' | 'system') => {
      setThemeModeState(mode);
      applyThemeAndAccent(mode, accentColor);
      try {
        localStorage.setItem(K_THEME, mode);
      } catch {
        // ignore
      }
    },
    [accentColor, applyThemeAndAccent]
  );

  const setAccentColor = useCallback(
    (accent: 'aurora' | 'ember' | 'moss' | 'ocean' | 'violet' | 'mono') => {
      setAccentColorState(accent);
      applyThemeAndAccent(themeMode, accent);
      try {
        localStorage.setItem(K_ACCENT, accent);
      } catch {
        // ignore
      }
    },
    [themeMode, applyThemeAndAccent]
  );

  const recordAnonProject = useCallback((projectId: string) => {
    try {
      const raw = localStorage.getItem(K_ANON);
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      if (!list.includes(projectId)) {
        list.push(projectId);
        localStorage.setItem(K_ANON, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  }, []);

  const getAnonProjects = useCallback((): string[] => {
    try {
      const raw = localStorage.getItem(K_ANON);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  const authHeaders = useCallback((): Record<string, string> => {
    const activeToken =
      token || (typeof window !== 'undefined' ? localStorage.getItem(K_TOKEN) : null);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (activeToken) {
      headers.Authorization = `Bearer ${activeToken}`;
    }
    return headers;
  }, [token]);

  const cartTotalCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartSubtotalUsd = cart.reduce((sum, i) => sum + i.priceUsd * i.qty, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        authLoading,
        countryCode,
        currency: countryCode,
        setCountryCode,
        formatPrice,
        cart,
        addToCart,
        updateCartQty,
        updateCartQuantity: updateCartQty,
        removeFromCart,
        clearCart,
        cartTotalCount,
        cartSubtotalUsd,
        themeMode,
        theme: themeMode,
        setThemeMode,
        setTheme: setThemeMode,
        accentColor,
        accent: accentColor,
        setAccentColor,
        setAccent: setAccentColor,
        authModalOpen,
        authModalTab,
        openAuthModal: (tab = 'login') => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        },
        closeAuthModal: () => setAuthModalOpen(false),
        setSessionFromPayload,
        signOut,
        logout: signOut,
        refreshUser,
        recordAnonProject,
        getAnonProjects,
        authHeaders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
