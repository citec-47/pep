import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatPrice, formatMg } from "@/lib/format";
import { StockBadge } from "@/components/ui";
import { ProductArtwork } from "@/components/product-artwork";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { deleteProductAction } from "../../actions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      media: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { media: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Catalogue</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted">
            {products.length} product{products.length === 1 ? "" : "s"} · only
            you can add or edit these.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-deep"
        >
          + New product
        </Link>
      </header>

      {products.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-ink">No products yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Create a category first, then add your first product and upload its
            photos and video.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-signal-deep"
          >
            Add a product
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => {
            const cover = p.media[0];
            const size = formatMg(p.sizeMg);
            return (
              <li key={p.id} className="card flex flex-wrap items-center gap-4 p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  {cover && cover.type === "image" ? (
                    <Image src={cover.url} alt="" fill sizes="64px" className="object-cover" />
                  ) : cover ? (
                    <span className="flex h-full w-full items-center justify-center font-mono text-[9px] text-muted">
                      VIDEO
                    </span>
                  ) : (
                    <ProductArtwork seed={p.slug} label={size} />
                  )}
                </div>

                <div className="min-w-48 flex-1">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="font-semibold text-ink hover:text-signal-deep"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {p.category.name}
                    {size && ` · ${size}`}
                    {` · ${p._count.media} media`}
                    {p.featured && " · ★ featured"}
                  </p>
                </div>

                <span className="text-sm font-semibold tabular-nums text-ink">
                  {formatPrice(p.priceCents)}
                </span>

                <span className="font-mono text-xs text-muted">
                  {p.stock} in stock
                </span>

                <StockBadge status={p.status} />

                <div className="ml-auto flex w-full items-center justify-end gap-1 sm:w-auto">
                  <Link
                    href={`/products/${p.slug}`}
                    target="_blank"
                    className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-signal-deep"
                  >
                    View ↗
                  </Link>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink-soft hover:border-signal hover:text-signal-deep"
                  >
                    Edit
                  </Link>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmSubmit
                      message={`Delete “${p.name}”? Its photos and video will be removed from the site. Past orders keep their record.`}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-alert"
                    >
                      Delete
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
