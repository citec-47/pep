import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/product-form";
import { createProductAction } from "../../../actions";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  if (categories.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-ink">
          Create a category first
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Every product belongs to a category. It is how buyers filter the
          catalogue. Add one, then come back.
        </p>
        <Link
          href="/admin/categories/new"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-signal-deep"
        >
          + New category
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-2">Catalogue</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          New product
        </h1>
      </header>

      <ProductForm
        action={createProductAction}
        categories={categories}
        submitLabel="Publish product"
      />
    </div>
  );
}
