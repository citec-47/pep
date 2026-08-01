import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatMg } from "@/lib/format";
import { ProductArtwork } from "./product-artwork";
import { StockBadge } from "./ui";

type CardProduct = {
  slug: string;
  name: string;
  priceCents: number;
  compareAtCents?: number | null;
  sizeMg?: number | null;
  purityPercent?: number | null;
  status: string;
  shortDescription?: string;
  category?: { name: string } | null;
  media?: { url: string; alt: string; type: string }[];
};

export function ProductCard({ product }: { product: CardProduct }) {
  const cover = product.media?.find((m) => m.type === "image");
  const hasVideo = product.media?.some((m) => m.type === "video");
  const size = formatMg(product.sizeMg);
  const soldOut = product.status === "SOLD_OUT";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-surface-2">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || product.name}
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 92vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              soldOut ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <ProductArtwork
            seed={product.slug}
            label={size}
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}

        {hasVideo && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Video
          </span>
        )}

        <span className="absolute top-2.5 right-2.5">
          <StockBadge status={product.status} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <p className="font-mono text-[10px] tracking-widest text-muted uppercase">
            {product.category.name}
          </p>
        )}

        <h3 className="text-base leading-snug font-semibold text-ink">
          {product.name}
        </h3>

        {(size || product.purityPercent) && (
          <p className="text-xs text-muted">
            {[size, product.purityPercent ? `≥ ${product.purityPercent}% purity` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        {product.shortDescription && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-2">
          <span className="text-lg font-semibold text-ink">
            {formatPrice(product.priceCents)}
          </span>
          {product.compareAtCents && product.compareAtCents > product.priceCents && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.compareAtCents)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
