import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/product-form";
import { updateProductAction } from "../../../../actions";

/** DB value -> form default, without printing "null" or "0" where blank is meant. */
function str(value: number | string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  return String(value);
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { media: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Catalogue</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Edit {product.name}
          </h1>
        </div>
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="text-sm text-signal-deep hover:underline"
        >
          View on storefront ↗
        </Link>
      </header>

      <ProductForm
        action={updateProductAction}
        categories={categories}
        submitLabel="Save changes"
        initial={{
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          sku: product.sku ?? undefined,
          price: (product.priceCents / 100).toFixed(2),
          compareAt:
            product.compareAtCents !== null
              ? (product.compareAtCents / 100).toFixed(2)
              : undefined,
          stock: String(product.stock),
          status: product.status,
          featured: product.featured,
          sequence: product.sequence ?? undefined,
          casNumber: product.casNumber ?? undefined,
          molecularFormula: product.molecularFormula ?? undefined,
          molecularWeight: str(product.molecularWeight),
          purityPercent: str(product.purityPercent),
          sizeMg: str(product.sizeMg),
          form: product.form,
          packSize: product.packSize ?? undefined,
          storage: product.storage ?? undefined,
          coaUrl: product.coaUrl ?? undefined,
          shortDescription: product.shortDescription,
          description: product.description,
          researchNotes: product.researchNotes ?? undefined,
          media: product.media.map((m) => ({
            url: m.url,
            type: m.type === "video" ? "video" : "image",
          })),
        }}
      />
    </div>
  );
}
