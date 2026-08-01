/** Cents -> "$1,250.00". */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** "12 Mar 2026", stable across server/client to avoid hydration drift. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

/** "5 mg" / "0.5 mg" without trailing zeros. */
export function formatMg(mg: number | null | undefined): string | null {
  if (mg === null || mg === undefined) return null;
  return `${Number(mg.toFixed(3))} mg`;
}

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "In stock",
  LOW_STOCK: "Low stock",
  SOLD_OUT: "Sold out",
  DRAFT: "Draft",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  PAID: "Paid",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
};

/** What the buyer sees on the order lookup page for each status. */
export const ORDER_STATUS_BLURBS: Record<string, string> = {
  NEW: "We have your request and are checking stock. You'll hear from us shortly with payment details.",
  CONFIRMED:
    "Your order is confirmed and reserved. Payment instructions have been sent to your email.",
  PAID: "Payment received. Your order is being packed for dispatch.",
  SHIPPED: "Your order has shipped. Tracking details were sent to your email.",
  CANCELLED: "This order was cancelled. Get in touch if that looks wrong.",
};
