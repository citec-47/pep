import { CategoryForm } from "@/components/category-form";
import { createCategoryAction } from "../../../actions";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-2">Catalogue</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          New category
        </h1>
      </header>

      <CategoryForm action={createCategoryAction} submitLabel="Create category" />
    </div>
  );
}
