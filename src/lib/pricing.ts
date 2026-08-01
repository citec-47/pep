/** Flat cold-chain shipping fee, waived above the threshold. */
export const SHIPPING_FLAT_CENTS = 2_500;
export const FREE_SHIPPING_THRESHOLD_CENTS = 30_000;

export function shippingFor(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

export function computeTotals(subtotalCents: number) {
  const shippingCents = shippingFor(subtotalCents);
  return {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

/** Max units of a single product per order request. */
export const MAX_QTY_PER_LINE = 99;
