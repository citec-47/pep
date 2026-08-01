import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { deleteCategoryAction } from "../../actions";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Catalogue</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted">
            How buyers filter the catalogue. Products must belong to one.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-deep"
        >
          + New category
        </Link>
      </header>

      {error && (
        <p className="rounded-xl bg-alert-soft px-4 py-3 text-sm text-alert">
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-ink">No categories yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Start with something broad, like “Metabolic peptides”, “Repair &amp;
            recovery” or “Reference standards”.
          </p>
          <Link
            href="/admin/categories/new"
            className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-signal-deep"
          >
            Add a category
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.id} className="card flex flex-wrap items-center gap-4 p-3">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {c.heroImage && (
                  <Image src={c.heroImage} alt="" fill sizes="80px" className="object-cover" />
                )}
              </div>

              <div className="min-w-48 flex-1">
                <Link
                  href={`/admin/categories/${c.id}/edit`}
                  className="font-semibold text-ink hover:text-signal-deep"
                >
                  {c.name}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                  <span className="font-mono">/{c.slug}</span>
                  {c.tagline && ` · ${c.tagline}`}
                </p>
              </div>

              <span className="font-mono text-xs text-muted">
                {c._count.products} product{c._count.products === 1 ? "" : "s"}
              </span>

              <span className="font-mono text-xs text-muted">
                sort {c.sortOrder}
              </span>

              <div className="ml-auto flex w-full items-center justify-end gap-1 sm:w-auto">
                <Link
                  href={`/products?category=${c.slug}`}
                  target="_blank"
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-signal-deep"
                >
                  View ↗
                </Link>
                <Link
                  href={`/admin/categories/${c.id}/edit`}
                  className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink-soft hover:border-signal hover:text-signal-deep"
                >
                  Edit
                </Link>
                <form action={deleteCategoryAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmit
                    message={`Delete the “${c.name}” category?`}
                    className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-alert"
                  >
                    Delete
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
