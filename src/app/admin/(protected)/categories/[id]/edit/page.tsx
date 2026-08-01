import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/components/category-form";
import { updateCategoryAction } from "../../../../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-2">Catalogue</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Edit {category.name}
        </h1>
      </header>

      <CategoryForm
        action={updateCategoryAction}
        submitLabel="Save changes"
        initial={{
          id: category.id,
          name: category.name,
          tagline: category.tagline,
          description: category.description,
          heroImage: category.heroImage ?? "",
          sortOrder: String(category.sortOrder),
        }}
      />
    </div>
  );
}
