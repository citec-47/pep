import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { formatPrice, formatMg } from "@/lib/format";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { AddToCart } from "@/components/add-to-cart";
import { SpecRow, StockBadge, ResearchNotice } from "@/components/ui";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description:
      product.shortDescription ||
      `${product.name}: research-grade peptide with full specification and certificate of analysis.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  const size = formatMg(product.sizeMg);
  const soldOut = product.status === "SOLD_OUT";
  const cover = product.media.find((m) => m.type === "image");

  const specs: { label: string; value: string; mono?: boolean }[] = [
    product.sequence && { label: "Sequence", value: product.sequence, mono: true },
    product.molecularFormula && {
      label: "Molecular formula",
      value: product.molecularFormula,
      mono: true,
    },
    product.molecularWeight && {
      label: "Molecular weight",
      value: `${product.molecularWeight} g/mol`,
      mono: true,
    },
    product.casNumber && { label: "CAS number", value: product.casNumber, mono: true },
    product.purityPercent && {
      label: "Purity (HPLC)",
      value: `≥ ${product.purityPercent}%`,
    },
    size && { label: "Vial size", value: size },
    { label: "Form", value: product.form },
    product.packSize && { label: "Pack size", value: product.packSize },
    product.sku && { label: "SKU", value: product.sku, mono: true },
    product.storage && { label: "Storage", value: product.storage },
  ].filter(Boolean) as { label: string; value: string; mono?: boolean }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/products" className="hover:text-signal-deep">
          Catalogue
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-signal-deep"
        >
          {product.category.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
        <ProductGallery
          media={product.media}
          name={product.name}
          seed={product.slug}
          label={size}
        />

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                {product.category.name}
              </p>
              <StockBadge status={product.status} />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-base leading-relaxed text-muted">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums text-ink">
              {formatPrice(product.priceCents)}
            </span>
            {product.compareAtCents &&
              product.compareAtCents > product.priceCents && (
                <span className="text-lg text-muted line-through">
                  {formatPrice(product.compareAtCents)}
                </span>
              )}
            {size && <span className="text-sm text-muted">per {size} vial</span>}
          </div>

          <AddToCart
            soldOut={soldOut}
            stock={product.stock}
            line={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              sizeLabel: size ?? undefined,
              priceCents: product.priceCents,
              image: cover?.url,
            }}
          />

          {specs.length > 0 && (
            <section className="card p-5">
              <h2 className="mb-2 text-base font-semibold text-ink">
                Specification
              </h2>
              <dl>
                {specs.map((s) => (
                  <SpecRow
                    key={s.label}
                    label={s.label}
                    value={s.value}
                    mono={s.mono}
                  />
                ))}
              </dl>

              {product.coaUrl && (
                <a
                  href={product.coaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-signal-deep hover:underline"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5M9 13h6M9 17h4" />
                  </svg>
                  View certificate of analysis
                </a>
              )}
            </section>
          )}

          <ResearchNotice />
        </div>
      </div>

      {(product.description || product.researchNotes) && (
        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          {product.description && (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-ink">Description</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
                {product.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {product.researchNotes && (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-ink">Research notes</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
                {product.researchNotes.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            More in {product.category.name}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
