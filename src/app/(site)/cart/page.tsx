import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { ResearchNotice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Your order",
  description: "Review the products in your order before submitting a request.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-3">Step 1 of 2</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Your order
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Adjust quantities below. Nothing is charged at this stage: the next
          step collects your shipping details and sends us the request.
        </p>
      </header>

      <CartView />

      <ResearchNotice className="mt-10" />
    </div>
  );
}
