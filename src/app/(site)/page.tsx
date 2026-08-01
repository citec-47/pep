import Link from "next/link";
import Image from "next/image";
import { getCategories, getFeaturedProducts, getLatestProducts } from "@/lib/data";
import { formatPrice, formatMg } from "@/lib/format";
import { ProductCard } from "@/components/product-card";
import { ProductArtwork } from "@/components/product-artwork";
import { ButtonLink, ResearchNotice, StockBadge } from "@/components/ui";

const WRAP = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedProducts(6),
    getLatestProducts(8),
    getCategories(),
  ]);

  // Featured first, then topped up with the newest stock so the row is never
  // left half empty when only one or two products are flagged.
  const showcase = [
    ...featured,
    ...latest.filter((l) => !featured.some((f) => f.id === l.id)),
  ];
  const spotlight = showcase[0];
  const grid = showcase.slice(1, 5);
  const stocked = categories.filter((c) => c._count.products > 0);

  return (
    <>
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="grid-bg border-b border-line bg-surface">
        <div className={`${WRAP} grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14 lg:py-24`}>
          <div>
            <p className="eyebrow mb-4">In stock this week</p>
            <h1 className="text-[2rem] leading-[1.12] font-semibold tracking-tight text-ink sm:text-5xl">
              Research peptides,
              <br className="hidden sm:block" /> documented properly.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Full specification on every listing, photography from the batch
              that ships, and a certificate of analysis whenever you ask for it.
              Nothing is charged until we have confirmed your order.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/products" className="w-full sm:w-auto">
                Browse the catalogue
              </ButtonLink>
              <ButtonLink href="/about" variant="outline" className="w-full sm:w-auto">
                How ordering works
              </ButtonLink>
            </div>

            <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] tracking-wide text-muted uppercase">
              <span>HPLC verified</span>
              <Dot />
              <span>COA on request</span>
              <Dot />
              <span>Cold chain</span>
              <Dot />
              <span>No card details taken</span>
            </p>
          </div>

          {/* One real product, rather than decorative filler. */}
          {spotlight && <Spotlight product={spotlight} />}
        </div>
      </section>

      {/* --------------------------- Catalogue ---------------------------- */}
      {grid.length > 0 && (
        <section className={`${WRAP} py-14 sm:py-20`}>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                More from the catalogue
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                Specifications are published in full on every product page,
                next to the photography for that batch.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-signal-deep hover:text-ink"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {grid.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {showcase.length === 0 && (
        <section className={`${WRAP} py-16 sm:py-24`}>
          <div className="card px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-ink">
              The catalogue is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Sign in to the admin area to add a category and your first
              product, then upload its photos and video.
            </p>
            <ButtonLink href="/admin" className="mt-6">
              Go to admin
            </ButtonLink>
          </div>
        </section>
      )}

      {/* --------------------------- Categories --------------------------- */}
      {stocked.length > 0 && (
        <section className="border-y border-line bg-surface">
          <div className={`${WRAP} grid gap-8 py-14 sm:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16`}>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Shop by class
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                Grouped the way a lab actually orders, not by marketing
                category.
              </p>
            </div>

            <ul className="divide-y divide-[var(--color-line)] border-y border-line">
              {stocked.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="group flex items-center gap-4 py-4 transition-colors hover:bg-base/60"
                  >
                    {c.heroImage && (
                      <span className="relative hidden h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-2 sm:block">
                        <Image src={c.heroImage} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink group-hover:text-signal-deep">
                        {c.name}
                      </span>
                      {c.tagline && (
                        <span className="mt-0.5 block truncate text-sm text-muted">
                          {c.tagline}
                        </span>
                      )}
                    </span>

                    <span className="shrink-0 font-mono text-xs text-muted">
                      {c._count.products}
                    </span>
                    <span className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5">
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------- Ordering ---------------------------- */}
      <section className={`${WRAP} py-14 sm:py-20`}>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Ordering, start to finish
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              We take no payment online and store no card details. An order is a
              request: you tell us what you need, we check the batch, and only
              then does money come into it.
            </p>
            <Link
              href="/orders"
              className="mt-5 inline-block text-sm font-semibold text-signal-deep hover:text-ink"
            >
              Track an existing order &rarr;
            </Link>
          </div>

          <ol className="space-y-5">
            {[
              [
                "Send the request",
                "Add what you need and submit your shipping details. A reference code like PEP-7QK3M2 comes back straight away.",
              ],
              [
                "We check the batch",
                "Usually inside one business day you get confirmation plus payment instructions by email.",
              ],
              [
                "Payment clears",
                "However suits you. Once it lands the order moves into the packing queue.",
              ],
              [
                "It ships cold",
                "Lyophilized material travels with ice packs and tracking. Follow it with your reference code.",
              ],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal-soft font-mono text-xs font-semibold text-signal-deep">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <ResearchNotice className="mt-12" />
      </section>
    </>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-muted/50" aria-hidden />;
}

type SpotlightProduct = Awaited<ReturnType<typeof getLatestProducts>>[number];

function Spotlight({ product }: { product: SpotlightProduct }) {
  const cover = product.media.find((m) => m.type === "image");
  const size = formatMg(product.sizeMg);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group relative overflow-hidden transition-shadow hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-surface-2 sm:aspect-16/10 lg:aspect-4/3">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || product.name}
            fill
            priority
            sizes="(min-width: 1024px) 460px, 92vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ProductArtwork
            seed={product.slug}
            label={size}
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-ink/85 px-2.5 py-1 font-mono text-[10px] tracking-widest text-white uppercase backdrop-blur">
          Featured
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] tracking-widest text-muted uppercase">
            {product.category.name}
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold text-ink group-hover:text-signal-deep">
            {product.name}
          </h2>
          {size && <p className="mt-0.5 text-sm text-muted">{size} vial</p>}
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-ink">
            {formatPrice(product.priceCents)}
          </p>
          <span className="mt-1 inline-block">
            <StockBadge status={product.status} />
          </span>
        </div>
      </div>
    </Link>
  );
}
