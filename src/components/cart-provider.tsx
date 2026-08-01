"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { MAX_QTY_PER_LINE } from "@/lib/pricing";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  sizeLabel?: string;
  priceCents: number;
  image?: string;
  qty: number;
};

const STORAGE_KEY = "pep_cart_v1";
const EMPTY: CartLine[] = [];

function readStored(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    // Drop anything that doesn't look like a line, so a stale format from an
    // older build can't crash the cart.
    return parsed.filter(
      (l): l is CartLine =>
        l && typeof l.productId === "string" && typeof l.qty === "number",
    );
  } catch {
    return EMPTY;
  }
}

/* --------------------------------------------------------------------------
 * The cart lives outside React in localStorage, so it is exposed as an
 * external store. useSyncExternalStore hands the server (and the hydrating
 * client) an empty cart, then swaps in the stored one once hydration is done.
 * That avoids both a markup mismatch and a setState-inside-an-effect.
 * ----------------------------------------------------------------------- */

let snapshot: CartLine[] =
  typeof window === "undefined" ? EMPTY : readStored();

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return EMPTY;
}

function write(next: CartLine[]) {
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing or a full quota. The in-memory cart still works.
  }
  for (const listener of listeners) listener();
}

/** False during SSR and the hydration pass, true once running on the client. */
const alwaysTrue = () => true;
const alwaysFalse = () => false;

type CartContextValue = {
  lines: CartLine[];
  /** False until the stored cart is available, so the UI can avoid a flash. */
  ready: boolean;
  count: number;
  subtotalCents: number;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribe, alwaysTrue, alwaysFalse);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    const existing = snapshot.find((l) => l.productId === line.productId);
    write(
      existing
        ? snapshot.map((l) =>
            l.productId === line.productId
              ? { ...l, qty: Math.min(MAX_QTY_PER_LINE, l.qty + qty) }
              : l,
          )
        : [...snapshot, { ...line, qty: Math.min(MAX_QTY_PER_LINE, qty) }],
    );
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    write(
      qty <= 0
        ? snapshot.filter((l) => l.productId !== productId)
        : snapshot.map((l) =>
            l.productId === productId
              ? { ...l, qty: Math.min(MAX_QTY_PER_LINE, qty) }
              : l,
          ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    write(snapshot.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotalCents: lines.reduce((n, l) => n + l.priceCents * l.qty, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, ready, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>.");
  return ctx;
}
