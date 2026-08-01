import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProducts, type ProductFilters } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { EmptyState, buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Browse research peptides by class, with full specifications, photography and video for each product.",
};

type Search = {
  category?: string;
  q?: string;
  sort?: string;
};

const SORTS: { value: NonNullable<ProductFilters["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

function isSort(value: string | undefined): value is NonNullable<ProductFilters["sort"]> {
  return SORTS.some((s) => s.value === value);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { category, q, sort } = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      category: category || undefined,
      q: q?.trim() || undefined,
      sort: isSort(sort) ? sort : undefined,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  /** Keep the current search + sort when switching category. */
  const chipHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <header className="max-w-2xl">
        <p className="eyebrow mb-3">Catalogue</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {activeCategory ? activeCategory.name : "All products"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          {activeCategory?.description ||
            "Every listing carries its full specification (sequence, molecular weight, purity and storage) plus the photography and video for that batch."}
        </p>
      </header>

      {/* ----------------------------- Filters ---------------------------- */}
      <div className="mt-8 space-y-4">
        <form method="get" action="/products" className="flex flex-wrap gap-3">
          {category && <input type="hidden" name="category" value={category} />}
          <div className="relative min-w-56 flex-1">
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name, CAS number or SKU…"
              className="field pl-10"
              aria-label="Search the catalogue"
            />
            <svg
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
          </div>

          <select
            name="sort"
            defaultValue={isSort(sort) ? sort : "newest"}
            aria-label="Sort products"
            className="field w-auto"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button type="submit" className={buttonClass("outline")}>
            Apply
          </button>
        </form>

        {categories.length > 0 && (
          <nav className="flex flex-wrap gap-2" aria-label="Filter by category">
            <CategoryChip href={chipHref()} active={!category}>
              All
            </CategoryChip>
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                href={chipHref(c.slug)}
                active={c.slug === category}
              >
                {c.name}
                <span className="ml-1.5 tabular-nums opacity-60">
                  {c._count.products}
                </span>
              </CategoryChip>
            ))}
          </nav>
        )}
      </div>

      {/* ----------------------------- Results ---------------------------- */}
      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-muted">
        {products.length} result{products.length === 1 ? "" : "s"}
      </p>

      {products.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Nothing matches that"
            body={
              q
                ? `No products match “${q}”. Try a shorter search, or clear the filters.`
                : "No products in this category yet. Add one from the admin area."
            }
            action={
              <Link href="/products" className={`${buttonClass("outline")} mt-2`}>
                Clear filters
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
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
