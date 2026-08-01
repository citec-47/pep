import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/format";
import { OrderStatusBadge } from "@/components/ui";

export default async function AdminDashboard() {
  const [
    productCount,
    draftCount,
    categoryCount,
    newOrders,
    paidAgg,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { status: { in: ["PAID", "SHIPPED"] } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { _count: { select: { items: true } } },
    }),
    prisma.product.findMany({
      where: { status: { not: "DRAFT" }, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, stock: true, slug: true },
    }),
  ]);

  const stats = [
    { label: "Products", value: String(productCount), href: "/admin/products", note: draftCount ? `${draftCount} draft` : "all published" },
    { label: "Categories", value: String(categoryCount), href: "/admin/categories" },
    { label: "New orders", value: String(newOrders), href: "/admin/orders?status=NEW", note: "awaiting confirmation" },
    { label: "Paid + shipped", value: formatPrice(paidAgg._sum.totalCents ?? 0), href: "/admin/orders", note: "lifetime" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Overview</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Admin dashboard
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-deep"
          >
            + New product
          </Link>
          <Link
            href="/admin/categories/new"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-signal hover:text-signal-deep"
          >
            + New category
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition-shadow hover:shadow-[var(--shadow-soft)]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {s.value}
            </p>
            {s.note && <p className="mt-1 text-xs text-muted">{s.note}</p>}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-ink">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-signal-deep hover:underline">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              No orders yet. They&apos;ll appear here the moment a buyer submits one.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-line)]">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2"
                  >
                    <span className="font-mono text-sm font-semibold text-ink">
                      {o.reference}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-muted">
                      {o.customerName} · {o._count.items} item
                      {o._count.items === 1 ? "" : "s"}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-ink">
                      {formatPrice(o.totalCents)}
                    </span>
                    <OrderStatusBadge status={o.status} />
                    <span className="w-full text-xs text-muted sm:w-auto">
                      {formatDateTime(o.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card overflow-hidden">
          <h2 className="border-b border-line px-5 py-4 text-base font-semibold text-ink">
            Low stock
          </h2>
          {lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Nothing running low.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-line)]">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="truncate text-sm text-ink hover:text-signal-deep">
                    {p.name}
                  </Link>
                  <span className={`shrink-0 font-mono text-xs ${p.stock === 0 ? "text-alert" : "text-amber"}`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
