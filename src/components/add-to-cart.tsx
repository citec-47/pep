"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, type CartLine } from "./cart-provider";
import { MAX_QTY_PER_LINE } from "@/lib/pricing";

export function AddToCart({
  line,
  soldOut,
  stock,
}: {
  line: Omit<CartLine, "qty">;
  soldOut: boolean;
  stock: number;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const max = Math.max(1, Math.min(MAX_QTY_PER_LINE, stock || MAX_QTY_PER_LINE));

  if (soldOut) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-line bg-surface-2 px-4 py-3.5 text-sm text-muted">
        This item is currently sold out.{" "}
        <Link href="/products" className="font-medium text-signal-deep hover:underline">
          Browse the catalogue
        </Link>{" "}
        or email us to be told when it&apos;s back.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line bg-surface">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="px-3.5 py-2.5 text-ink-soft transition-colors hover:text-signal-deep disabled:opacity-30"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => {
              const n = Number(e.target.value);
              setQty(Number.isFinite(n) ? Math.min(max, Math.max(1, Math.floor(n))) : 1);
            }}
            aria-label="Quantity"
            className="w-14 border-0 bg-transparent text-center text-sm font-semibold tabular-nums text-ink focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={qty >= max}
            aria-label="Increase quantity"
            className="px-3.5 py-2.5 text-ink-soft transition-colors hover:text-signal-deep disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            add(line, qty);
            setAdded(true);
          }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-deep sm:flex-none"
        >
          Add to order
        </button>
      </div>

      {added && (
        <p className="flex items-center gap-2 text-sm text-signal-deep">
          <span aria-hidden>✓</span> Added to your order.{" "}
          <Link href="/cart" className="font-semibold underline underline-offset-2">
            Review order
          </Link>
        </p>
      )}

      {stock > 0 && stock <= 5 && (
        <p className="text-xs text-amber">Only {stock} left in stock.</p>
      )}
    </div>
  );
}
