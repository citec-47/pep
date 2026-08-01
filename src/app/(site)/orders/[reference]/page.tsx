import Link from "next/link";
import type { Metadata } from "next";
import { getOrderByReference } from "@/lib/data";
import { formatPrice, formatDateTime, ORDER_STATUS_BLURBS } from "@/lib/format";
import { OrderStatusBadge, EmptyState, buttonClass } from "@/components/ui";

type Params = { reference: string };

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

const STEPS = ["NEW", "CONFIRMED", "PAID", "SHIPPED"] as const;
const STEP_LABELS: Record<string, string> = {
  NEW: "Received",
  CONFIRMED: "Confirmed",
  PAID: "Paid",
  SHIPPED: "Shipped",
};

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { reference } = await params;
  const order = await getOrderByReference(decodeURIComponent(reference));

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <EmptyState
          title="No order with that code"
          body="Double-check the reference from your confirmation. Case does not matter, but every character counts."
          action={
            <Link href="/orders" className={`${buttonClass("outline")} mt-2`}>
              Try another code
            </Link>
          }
        />
      </div>
    );
  }

  const currentStep = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Order</p>
          <h1 className="font-mono text-2xl font-semibold tracking-tight break-all text-ink sm:text-3xl">
            {order.reference}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <p className="card mt-6 p-5 text-sm leading-relaxed text-ink-soft">
        {ORDER_STATUS_BLURBS[order.status] ?? "We're processing your order."}
      </p>

      {/* ------------------------- Progress rail -------------------------- */}
      {!cancelled && (
        <ol className="mt-8 grid grid-cols-4 gap-2">
          {STEPS.map((step, i) => {
            const done = currentStep >= i;
            return (
              <li key={step} className="flex flex-col gap-2">
                <span
                  className={`h-1 rounded-full ${done ? "bg-signal" : "bg-line"}`}
                  aria-hidden
                />
                <span
                  className={`font-mono text-[9px] tracking-wide uppercase sm:text-[10px] sm:tracking-widest ${
                    done ? "text-signal-deep" : "text-muted"
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* ----------------------------- Items ------------------------------ */}
      <section className="card mt-8 overflow-hidden">
        <h2 className="border-b border-line px-4 py-4 sm:px-5 text-base font-semibold text-ink">
          Items
        </h2>

        <ul className="divide-y divide-[var(--color-line)]">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                {item.slugSnapshot ? (
                  <Link
                    href={`/products/${item.slugSnapshot}`}
                    className="font-medium text-ink hover:text-signal-deep"
                  >
                    {item.nameSnapshot}
                  </Link>
                ) : (
                  <span className="font-medium text-ink">{item.nameSnapshot}</span>
                )}
                <p className="mt-0.5 text-sm text-muted">
                  {item.sizeSnapshot && (
                    <span className="font-mono">{item.sizeSnapshot} · </span>
                  )}
                  {formatPrice(item.unitPriceCents)} × {item.quantity}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                {formatPrice(item.lineTotalCents)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-line px-4 py-4 sm:px-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums text-ink">
              {formatPrice(order.subtotalCents)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="tabular-nums text-ink">
              {order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-semibold text-ink">Total</dt>
            <dd className="font-semibold tabular-nums text-ink">
              {formatPrice(order.totalCents)}
            </dd>
          </div>
        </dl>
      </section>

      {/* ---------------------------- Shipping ---------------------------- */}
      <section className="card mt-6 p-5">
        <h2 className="text-base font-semibold text-ink">Shipping to</h2>
        <address className="mt-3 text-sm leading-relaxed text-ink-soft not-italic">
          {order.customerName}
          {order.organization && <><br />{order.organization}</>}
          <br />
          {order.addressLine1}
          {order.addressLine2 && <><br />{order.addressLine2}</>}
          <br />
          {[order.city, order.state, order.postalCode].filter(Boolean).join(", ")}
          <br />
          {order.country}
        </address>

        {order.notes && (
          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            <span className="font-medium text-ink-soft">Your notes: </span>
            {order.notes}
          </p>
        )}
      </section>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        Keep this reference safe. It is the quickest way to check status.
        Questions? Reply to your confirmation email and quote{" "}
        <span className="font-mono text-ink">{order.reference}</span>.
      </p>
    </div>
  );
}
