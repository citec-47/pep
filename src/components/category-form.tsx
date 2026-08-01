"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { SingleImageUpload } from "./media-uploader";

type ActionState = { error?: string } | undefined;
type FormAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export type CategoryInitial = {
  id?: string;
  name?: string;
  tagline?: string;
  description?: string;
  heroImage?: string;
  sortOrder?: string;
};

export function CategoryForm({
  action,
  initial = {},
  submitLabel,
}: {
  action: FormAction;
  initial?: CategoryInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [heroImage, setHeroImage] = useState(initial.heroImage ?? "");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <section className="card space-y-4 p-5">
        <label className="block">
          <span className="label">Category name</span>
          <input name="name" required defaultValue={initial.name} className="field" placeholder="Metabolic peptides" />
        </label>

        <label className="block">
          <span className="label">Tagline (shown on the homepage card)</span>
          <input name="tagline" maxLength={160} defaultValue={initial.tagline} className="field" placeholder="GLP-1 and related metabolic research compounds." />
        </label>

        <label className="block">
          <span className="label">Description (shown at the top of the filtered catalogue)</span>
          <textarea name="description" rows={4} defaultValue={initial.description} className="field resize-none" />
        </label>

        <label className="block">
          <span className="label">Sort order</span>
          <input name="sortOrder" type="number" min="0" step="1" defaultValue={initial.sortOrder ?? "0"} className="field w-32" />
          <span className="mt-1 block text-xs text-muted">
            Lower numbers appear first.
          </span>
        </label>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="text-base font-semibold text-ink">Banner image</h2>
        <SingleImageUpload
          name="heroImage"
          value={heroImage}
          onChange={setHeroImage}
        />
      </section>

      {state?.error && (
        <p className="rounded-xl bg-alert-soft px-4 py-3 text-sm text-alert">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/admin/categories"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-signal hover:text-signal-deep"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
