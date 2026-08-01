import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/format";
import { OrderStatusBadge } from "@/components/ui";
import { ConfirmSubmit } from "@/components/confirm-submit";
import {
  setOrderStatusAction,
  saveOrderNotesAction,
  deleteOrderAction,
} from "../../../actions";

const FLOW = ["NEW", "CONFIRMED", "PAID", "SHIPPED", "CANCELLED"];

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const mailto = `mailto:${order.email}?subject=${encodeURIComponent(
    `Your order ${order.reference}`,
  )}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-muted hover:text-signal-deep">
          ← All orders
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Order</p>
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-ink">
            {order.reference}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Placed {formatDateTime(order.createdAt)} · updated{" "}
            {formatDateTime(order.updatedAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      {/* --------------------------- Status rail -------------------------- */}
      <section className="card p-5">
        <h2 className="text-base font-semibold text-ink">Move this order</h2>
        <p className="mt-1 text-sm text-muted">
          The buyer sees this status on their order page straight away.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {FLOW.map((s) => (
            <form key={s} action={setOrderStatusAction}>
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value={s} />
              <button
                type="submit"
                disabled={order.status === s}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  order.status === s
                    ? "cursor-default border-ink bg-ink text-white"
                    : s === "CANCELLED"
                      ? "border-line text-muted hover:border-alert hover:text-alert"
                      : "border-line text-ink-soft hover:border-signal hover:text-signal-deep"
                }`}
              >
                {ORDER_STATUS_LABELS[s]}
              </button>
            </form>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        {/* ------------------------------ Items --------------------------- */}
        <section className="card overflow-hidden">
          <h2 className="border-b border-line px-5 py-4 text-base font-semibold text-ink">
            Items
          </h2>

          <ul className="divide-y divide-[var(--color-line)]">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  {item.slugSnapshot ? (
                    <Link
                      href={`/products/${item.slugSnapshot}`}
                      target="_blank"
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
                    {!item.productId && (
                      <span className="ml-2 text-xs text-amber">
                        (product since deleted)
                      </span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                  {formatPrice(item.lineTotalCents)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
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

        <div className="space-y-6">
          {/* ---------------------------- Buyer --------------------------- */}
          <section className="card p-5">
            <h2 className="text-base font-semibold text-ink">Buyer</h2>

            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Name" value={order.customerName} />
              <Row
                label="Email"
                value={
                  <a href={mailto} className="text-signal-deep hover:underline">
                    {order.email}
                  </a>
                }
              />
              {order.phone && <Row label="Phone" value={order.phone} />}
              {order.organization && (
                <Row label="Organisation" value={order.organization} />
              )}
            </dl>

            <h3 className="mt-5 text-sm font-semibold text-ink">Ship to</h3>
            <address className="mt-2 text-sm leading-relaxed text-ink-soft not-italic">
              {order.addressLine1}
              {order.addressLine2 && <><br />{order.addressLine2}</>}
              <br />
              {[order.city, order.state, order.postalCode].filter(Boolean).join(", ")}
              <br />
              {order.country}
            </address>

            {order.notes && (
              <>
                <h3 className="mt-5 text-sm font-semibold text-ink">
                  Buyer&apos;s notes
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {order.notes}
                </p>
              </>
            )}

            <a
              href={mailto}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-deep"
            >
              Email the buyer
            </a>
          </section>

          {/* ------------------------ Internal notes ---------------------- */}
          <section className="card p-5">
            <h2 className="text-base font-semibold text-ink">Internal notes</h2>
            <p className="mt-1 text-sm text-muted">
              Only you see these: payment method, tracking number, anything.
            </p>

            <form action={saveOrderNotesAction} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <textarea
                name="adminNotes"
                rows={5}
                defaultValue={order.adminNotes ?? ""}
                className="field resize-none"
                placeholder="Paid by bank transfer 12 Mar · DHL 1234567890"
              />
              <button
                type="submit"
                className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-signal hover:text-signal-deep"
              >
                Save notes
              </button>
            </form>
          </section>

          <form action={deleteOrderAction}>
            <input type="hidden" name="id" value={order.id} />
            <ConfirmSubmit
              message={`Permanently delete order ${order.reference}? This cannot be undone.`}
              className="text-xs text-muted underline-offset-2 hover:text-alert hover:underline"
            >
              Delete this order
            </ConfirmSubmit>
          </form>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{value}</dd>
    </div>
  );
}
