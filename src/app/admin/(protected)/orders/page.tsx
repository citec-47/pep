import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/format";
import { OrderStatusBadge } from "@/components/ui";

const STATUSES = Object.keys(ORDER_STATUS_LABELS);

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = status && STATUSES.includes(status) ? status : undefined;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: active ? { status: active } : undefined,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (s: string) =>
    counts.find((c) => c.status === s)?._count._all ?? 0;
  const total = counts.reduce((n, c) => n + c._count._all, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-2">Order desk</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Orders</h1>
        <p className="mt-1 text-sm text-muted">
          Buyers submit requests here. Confirm stock, send payment instructions,
          then move the order along.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        <FilterChip href="/admin/orders" active={!active}>
          All <span className="ml-1.5 tabular-nums opacity-60">{total}</span>
        </FilterChip>
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={`/admin/orders?status=${s}`}
            active={active === s}
          >
            {ORDER_STATUS_LABELS[s]}
            <span className="ml-1.5 tabular-nums opacity-60">{countFor(s)}</span>
          </FilterChip>
        ))}
      </nav>

      {orders.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-ink">
            {active ? `No ${ORDER_STATUS_LABELS[active].toLowerCase()} orders` : "No orders yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {active
              ? "Try a different filter."
              : "Once a buyer submits an order request it lands here immediately."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="card flex flex-wrap items-center gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-soft)]"
              >
                <span className="font-mono text-sm font-semibold text-ink">
                  {o.reference}
                </span>

                <div className="min-w-40 flex-1">
                  <p className="text-sm font-medium text-ink">{o.customerName}</p>
                  <p className="text-xs text-muted">
                    {o.email} · {o.country}
                  </p>
                </div>

                <span className="font-mono text-xs text-muted">
                  {o._count.items} item{o._count.items === 1 ? "" : "s"}
                </span>

                <span className="text-sm font-semibold tabular-nums text-ink">
                  {formatPrice(o.totalCents)}
                </span>

                <OrderStatusBadge status={o.status} />

                <span className="text-xs text-muted">
                  {formatDateTime(o.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-surface text-ink-soft hover:border-signal/50 hover:text-signal-deep"
      }`}
    >
      {children}
    </Link>
  );
}
