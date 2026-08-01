import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { placeOrderAction } from "../actions";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Submit your order request. No payment is taken online.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-3">Step 2 of 2</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Shipping &amp; contact details
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Tell us where this is going. You&apos;ll get a reference code
          immediately, and payment instructions by email once we confirm stock.
        </p>
      </header>

      <CheckoutForm action={placeOrderAction} />
    </div>
  );
}
