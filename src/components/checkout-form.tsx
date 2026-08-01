"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/format";
import { shippingFor } from "@/lib/pricing";
import { buttonClass } from "./ui";

export type CheckoutState =
  | { error?: string; reference?: undefined }
  | { reference: string; error?: undefined }
  | undefined;

type CheckoutAction = (
  prev: CheckoutState,
  formData: FormData,
) => Promise<CheckoutState>;

export function CheckoutForm({ action }: { action: CheckoutAction }) {
  const { lines, ready, subtotalCents, clear } = useCart();
  const [state, formAction, pending] = useActionState(action, undefined);
  const router = useRouter();

  const reference = state?.reference;

  // On success: empty the cart, then send the buyer to their order page.
  useEffect(() => {
    if (!reference) return;
    clear();
    router.replace(`/orders/${reference}`);
  }, [reference, clear, router]);

  if (!ready) {
    return <div className="card h-96 animate-pulse bg-surface-2" />;
  }

  if (reference) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="text-sm text-muted">
          Order {reference} placed. Taking you to your order…
        </p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-ink">Nothing to order yet</h2>
        <p className="max-w-sm text-sm text-muted">
          Add a product to your order before checking out.
        </p>
        <Link href="/products" className={buttonClass("solid")}>
          Browse catalogue
        </Link>
      </div>
    );
  }

  const shippingCents = shippingFor(subtotalCents);

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      {/* The server re-prices every line from the database; these are just the picks. */}
      {lines.map((l) => (
        <input
          key={l.productId}
          type="hidden"
          name="items"
          value={`${l.productId}::${l.qty}`}
        />
      ))}

      <div className="space-y-5">
        <section className="card space-y-4 p-5">
          <h2 className="text-base font-semibold text-ink">Your details</h2>

          <label className="block">
            <span className="label">Full name</span>
            <input name="customerName" required autoComplete="name" className="field" placeholder="Dr. Alex Moreau" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Email</span>
              <input name="email" type="email" required autoComplete="email" className="field" placeholder="you@lab.org" />
            </label>
            <label className="block">
              <span className="label">Phone / WhatsApp (optional)</span>
              <input name="phone" autoComplete="tel" className="field" placeholder="+1 555 010 0000" />
            </label>
          </div>

          <label className="block">
            <span className="label">Institution or company (optional)</span>
            <input name="organization" autoComplete="organization" className="field" placeholder="Meridian Research Labs" />
          </label>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="text-base font-semibold text-ink">Shipping address</h2>

          <label className="block">
            <span className="label">Street address</span>
            <input name="addressLine1" required autoComplete="address-line1" className="field" placeholder="140 Chemin Way" />
          </label>

          <label className="block">
            <span className="label">Apartment, suite, unit (optional)</span>
            <input name="addressLine2" autoComplete="address-line2" className="field" placeholder="Building B, Lab 4" />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="label">City</span>
              <input name="city" required autoComplete="address-level2" className="field" />
            </label>
            <label className="block">
              <span className="label">State / region</span>
              <input name="state" autoComplete="address-level1" className="field" />
            </label>
            <label className="block">
              <span className="label">Postal code</span>
              <input name="postalCode" required autoComplete="postal-code" className="field" />
            </label>
          </div>

          <label className="block">
            <span className="label">Country</span>
            <input name="country" required autoComplete="country-name" className="field" placeholder="United States" />
          </label>

          <label className="block">
            <span className="label">Notes for us (optional)</span>
            <textarea name="notes" rows={3} className="field resize-none" placeholder="Preferred courier, delivery window, purchase order number…" />
          </label>
        </section>
      </div>

      <aside className="card sticky top-24 space-y-4 p-5">
        <h2 className="text-base font-semibold text-ink">Your order</h2>

        <ul className="space-y-2.5 border-b border-line pb-4">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 text-ink-soft">
                <span className="font-medium text-ink">{l.name}</span>
                {l.sizeLabel && (
                  <span className="font-mono text-xs text-muted"> · {l.sizeLabel}</span>
                )}
                <span className="text-muted"> × {l.qty}</span>
              </span>
              <span className="shrink-0 tabular-nums text-ink">
                {formatPrice(l.priceCents * l.qty)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums text-ink">{formatPrice(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="tabular-nums text-ink">
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

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="researchUse"
            required
            className="mt-0.5 h-4 w-4 rounded border-line accent-[var(--color-signal-deep)]"
          />
          <span className="text-xs leading-relaxed text-ink-soft">
            I confirm these materials are for laboratory research use only, not
            for human or animal consumption, and that I am authorised to receive
            them in my jurisdiction.
          </span>
        </label>

        {state?.error && (
          <p className="rounded-lg bg-alert-soft px-3 py-2 text-sm text-alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`${buttonClass("solid")} w-full disabled:opacity-60`}
        >
          {pending ? "Placing order…" : "Place order request"}
        </button>

        <p className="text-center text-xs leading-relaxed text-muted">
          No card is charged. We reply with stock confirmation and payment
          instructions, usually within one business day.
        </p>
      </aside>
    </form>
  );
}
