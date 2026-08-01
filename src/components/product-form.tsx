"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { MediaUploader, type MediaItem } from "./media-uploader";

type Category = { id: string; name: string };

type ActionState = { error?: string } | undefined;
type FormAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export type ProductInitial = {
  id?: string;
  name?: string;
  categoryId?: string;
  sku?: string;
  price?: string; // dollars
  compareAt?: string;
  stock?: string;
  status?: string;
  featured?: boolean;
  sequence?: string;
  casNumber?: string;
  molecularFormula?: string;
  molecularWeight?: string;
  purityPercent?: string;
  sizeMg?: string;
  form?: string;
  packSize?: string;
  storage?: string;
  coaUrl?: string;
  shortDescription?: string;
  description?: string;
  researchNotes?: string;
  media?: MediaItem[];
};

const FORMS = [
  "Lyophilized powder",
  "Solution",
  "Capsule",
  "Nasal spray",
  "Reference standard",
];

export function ProductForm({
  action,
  categories,
  initial = {},
  submitLabel,
}: {
  action: FormAction;
  categories: Category[];
  initial?: ProductInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [media, setMedia] = useState<MediaItem[]>(initial.media ?? []);
  const [uploading, setUploading] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {media.map((m, i) => (
        <input
          key={`${m.url}-${i}`}
          type="hidden"
          name="media"
          value={`${m.type}::${m.url}`}
        />
      ))}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-6">
          {/* ------------------------- Basics ------------------------- */}
          <section className="card space-y-4 p-5">
            <h2 className="text-base font-semibold text-ink">Basics</h2>

            <label className="block">
              <span className="label">Product name</span>
              <input name="name" required defaultValue={initial.name} className="field" placeholder="BPC-157" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Category</span>
                <select name="categoryId" required defaultValue={initial.categoryId ?? ""} className="field">
                  <option value="" disabled>
                    Choose a category…
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label">SKU (optional)</span>
                <input name="sku" defaultValue={initial.sku} className="field font-mono" placeholder="PEP-BPC-5MG" />
              </label>
            </div>

            <label className="block">
              <span className="label">Short description (shown on cards)</span>
              <input name="shortDescription" defaultValue={initial.shortDescription} maxLength={300} className="field" placeholder="Pentadecapeptide studied for tissue-repair models." />
            </label>

            <label className="block">
              <span className="label">Full description</span>
              <textarea name="description" rows={5} defaultValue={initial.description} className="field resize-none" placeholder="Blank line between paragraphs. Describe the material, its handling and what's included." />
            </label>

            <label className="block">
              <span className="label">Research notes (optional)</span>
              <textarea name="researchNotes" rows={3} defaultValue={initial.researchNotes} className="field resize-none" placeholder="Reconstitution guidance, published assay references, handling cautions…" />
            </label>
          </section>

          {/* ---------------------- Specification ---------------------- */}
          <section className="card space-y-4 p-5">
            <h2 className="text-base font-semibold text-ink">Specification</h2>
            <p className="-mt-2 text-sm text-muted">
              Anything left blank is simply hidden from the product page.
            </p>

            <label className="block">
              <span className="label">Amino acid sequence</span>
              <textarea name="sequence" rows={2} defaultValue={initial.sequence} className="field resize-none font-mono text-sm" placeholder="Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Molecular formula</span>
                <input name="molecularFormula" defaultValue={initial.molecularFormula} className="field font-mono" placeholder="C62H98N16O22" />
              </label>
              <label className="block">
                <span className="label">Molecular weight (g/mol)</span>
                <input name="molecularWeight" type="number" step="0.01" min="0" defaultValue={initial.molecularWeight} className="field" placeholder="1419.53" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="label">CAS number</span>
                <input name="casNumber" defaultValue={initial.casNumber} className="field font-mono" placeholder="137525-51-0" />
              </label>
              <label className="block">
                <span className="label">Purity (%)</span>
                <input name="purityPercent" type="number" step="0.1" min="0" max="100" defaultValue={initial.purityPercent} className="field" placeholder="99.2" />
              </label>
              <label className="block">
                <span className="label">Vial size (mg)</span>
                <input name="sizeMg" type="number" step="0.01" min="0" defaultValue={initial.sizeMg} className="field" placeholder="5" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Form</span>
                <input name="form" required list="product-forms" defaultValue={initial.form ?? FORMS[0]} className="field" />
                <datalist id="product-forms">
                  {FORMS.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </label>
              <label className="block">
                <span className="label">Pack size (optional)</span>
                <input name="packSize" defaultValue={initial.packSize} className="field" placeholder="10 vials per box" />
              </label>
            </div>

            <label className="block">
              <span className="label">Storage</span>
              <input name="storage" defaultValue={initial.storage} className="field" placeholder="Store lyophilized at −20 °C, protect from light" />
            </label>

            <label className="block">
              <span className="label">Certificate of analysis URL (optional)</span>
              <input name="coaUrl" type="url" defaultValue={initial.coaUrl} className="field" placeholder="https://…/coa-batch-2411.pdf" />
            </label>
          </section>
        </div>

        <div className="space-y-6">
          {/* ------------------------ Commerce ------------------------ */}
          <section className="card space-y-4 p-5">
            <h2 className="text-base font-semibold text-ink">Pricing &amp; stock</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Price (USD)</span>
                <input name="price" type="number" min="0" step="0.01" required defaultValue={initial.price} className="field" placeholder="59.00" />
              </label>
              <label className="block">
                <span className="label">Compare-at (optional)</span>
                <input name="compareAt" type="number" min="0" step="0.01" defaultValue={initial.compareAt} className="field" placeholder="79.00" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Units in stock</span>
                <input name="stock" type="number" min="0" step="1" required defaultValue={initial.stock ?? "0"} className="field" />
              </label>
              <label className="block">
                <span className="label">Status</span>
                <select name="status" required defaultValue={initial.status ?? "AVAILABLE"} className="field">
                  <option value="AVAILABLE">In stock</option>
                  <option value="LOW_STOCK">Low stock</option>
                  <option value="SOLD_OUT">Sold out</option>
                  <option value="DRAFT">Draft (hidden from storefront)</option>
                </select>
              </label>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={initial.featured}
                className="h-4 w-4 rounded border-line accent-[var(--color-signal-deep)]"
              />
              <span className="text-sm font-medium text-ink-soft">
                Feature on the homepage
              </span>
            </label>
          </section>

          {/* ------------------------- Media -------------------------- */}
          <section className="card space-y-3 p-5">
            <h2 className="text-base font-semibold text-ink">Photos &amp; video</h2>
            <p className="text-sm text-muted">
              The first item is the cover shown on cards. Reorder with the
              arrows. Files upload straight to Cloudinary.
            </p>

            <MediaUploader
              media={media}
              onChange={setMedia}
              onUploadingChange={setUploading}
            />
          </section>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-xl bg-alert-soft px-4 py-3 text-sm text-alert">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : uploading ? "Waiting for upload…" : submitLabel}
        </button>
        <Link
          href="/admin/products"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-signal hover:text-signal-deep"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
