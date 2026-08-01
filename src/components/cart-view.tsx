"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { ProductArtwork } from "./product-artwork";
import { formatPrice } from "@/lib/format";
import {
  shippingFor,
  FREE_SHIPPING_THRESHOLD_CENTS,
  MAX_QTY_PER_LINE,
} from "@/lib/pricing";
import { buttonClass } from "./ui";

export function CartView() {
  const { lines, ready, subtotalCents, setQty, remove, clear } = useCart();

  if (!ready) {
    return <div className="card h-64 animate-pulse bg-surface-2" />;
  }

  if (lines.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-ink">Your order is empty</h2>
        <p className="max-w-sm text-sm text-muted">
          Add products from the catalogue and they&apos;ll collect here. Nothing
          is charged. Placing an order sends us a request.
        </p>
        <Link href="/products" className={buttonClass("solid")}>
          Browse catalogue
        </Link>
      </div>
    );
  }

  const shippingCents = shippingFor(subtotalCents);
  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <ul className="space-y-3">
        {lines.map((line) => (
          <li key={line.productId} className="card flex gap-4 p-3">
            <Link
              href={`/products/${line.slug}`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2 sm:h-24 sm:w-24"
            >
              {line.image ? (
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <ProductArtwork seed={line.slug} label={line.sizeLabel} />
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link
                href={`/products/${line.slug}`}
                className="font-semibold text-ink hover:text-signal-deep"
              >
                {line.name}
              </Link>
              {line.sizeLabel && (
                <p className="font-mono text-xs text-muted">{line.sizeLabel}</p>
              )}
              <p className="text-sm text-muted">
                {formatPrice(line.priceCents)} each
              </p>

              <div className="mt-auto flex items-center gap-3 pt-2">
                <div className="inline-flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    onClick={() => setQty(line.productId, line.qty - 1)}
                    aria-label={`Decrease quantity of ${line.name}`}
                    className="px-3 py-1.5 text-ink-soft hover:text-signal-deep"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(line.productId, line.qty + 1)}
                    disabled={line.qty >= MAX_QTY_PER_LINE}
                    aria-label={`Increase quantity of ${line.name}`}
                    className="px-3 py-1.5 text-ink-soft hover:text-signal-deep disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => remove(line.productId)}
                  className="text-xs text-muted underline-offset-2 hover:text-alert hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="order-last shrink-0 self-start text-right text-sm font-semibold tabular-nums text-ink">
              {formatPrice(line.priceCents * line.qty)}
            </div>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={clear}
            className="text-xs text-muted underline-offset-2 hover:text-alert hover:underline"
          >
            Clear order
          </button>
        </li>
      </ul>

      <aside className="card sticky top-24 space-y-4 p-5">
        <h2 className="text-base font-semibold text-ink">Summary</h2>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-medium tabular-nums text-ink">
              {formatPrice(subtotalCents)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping (cold chain)</dt>
            <dd className="font-medium tabular-nums text-ink">
              {shippingCents === 0 ? "Free" : formatPrice(shippingCents)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-semibold text-ink">Total</dt>
            <dd className="font-semibold tabular-nums text-ink">
              {formatPrice(subtotalCents + shippingCents)}
            </dd>
          </div>
        </dl>

        {remaining > 0 && (
          <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
            Add {formatPrice(remaining)} more for free shipping.
          </p>
        )}

        <Link href="/checkout" className={`${buttonClass("solid")} w-full`}>
          Continue to details
        </Link>

        <p className="text-center text-xs leading-relaxed text-muted">
          No payment is taken online. We confirm stock and send payment
          instructions by email.
        </p>
      </aside>
    </div>
  );
}
