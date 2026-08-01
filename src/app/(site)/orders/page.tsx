import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Track an order",
  description: "Look up the status of an order with your reference code.",
};

export default async function OrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function lookup(formData: FormData) {
    "use server";
    const raw = formData.get("reference");
    const reference =
      typeof raw === "string" ? raw.trim().toUpperCase() : "";
    if (!reference) {
      redirect("/orders?error=Enter+your+reference+code.");
    }
    // Tolerate someone typing "7QK3M2" without the prefix.
    const normalised = reference.startsWith("PEP-")
      ? reference
      : `PEP-${reference}`;
    redirect(`/orders/${encodeURIComponent(normalised)}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <p className="eyebrow mb-3">Order status</p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Track an order
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Enter the reference code from your order confirmation. It looks like
        <span className="font-mono text-ink"> PEP-7QK3M2</span>.
      </p>

      <form action={lookup} className="card mt-8 space-y-4 p-5">
        <label className="block">
          <span className="label">Reference code</span>
          <input
            name="reference"
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="PEP-7QK3M2"
            className="field font-mono uppercase"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-alert-soft px-3 py-2 text-sm text-alert">
            {error}
          </p>
        )}

        <button type="submit" className={`${buttonClass("solid")} w-full`}>
          Look up order
        </button>
      </form>

      <p className="mt-6 text-sm leading-relaxed text-muted">
        Lost your code? Email us from the address you ordered with and we&apos;ll
        resend it.
      </p>
    </div>
  );
}
