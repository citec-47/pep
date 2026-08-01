"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getProductsForCart } from "@/lib/data";
import { checkoutSchema, generateOrderReference } from "@/lib/validation";
import { computeTotals } from "@/lib/pricing";
import { formatMg } from "@/lib/format";

type CheckoutState =
  | { error?: string; reference?: undefined }
  | { reference: string; error?: undefined }
  | undefined;

/** Cart lines arrive as hidden inputs named "items", encoded `productId::qty`. */
function parseItems(formData: FormData) {
  const seen = new Map<string, number>();
  for (const raw of formData.getAll("items")) {
    if (typeof raw !== "string" || !raw.includes("::")) continue;
    const sep = raw.indexOf("::");
    const productId = raw.slice(0, sep);
    const qty = Number(raw.slice(sep + 2));
    if (!productId || !Number.isFinite(qty) || qty < 1) continue;
    seen.set(productId, Math.min(99, Math.floor(qty)));
  }
  return [...seen.entries()].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

/** Retry a few times in the astronomically unlikely event of a code collision. */
async function uniqueReference() {
  for (let i = 0; i < 8; i++) {
    const reference = generateOrderReference();
    const clash = await prisma.order.findUnique({ where: { reference } });
    if (!clash) return reference;
  }
  throw new Error("Could not allocate an order reference.");
}

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const items = parseItems(formData);
  if (items.length === 0) {
    return { error: "Your order is empty." };
  }

  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    organization: formData.get("organization"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    notes: formData.get("notes"),
    researchUse:
      formData.get("researchUse") === "on" ||
      formData.get("researchUse") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  // Re-price everything server-side. The client's prices are never trusted.
  const products = await getProductsForCart(items.map((i) => i.productId));
  const byId = new Map(products.map((p) => [p.id, p]));

  const soldOut = items
    .map((i) => byId.get(i.productId))
    .filter((p) => p && p.status === "SOLD_OUT");
  if (soldOut.length > 0) {
    return {
      error: `${soldOut[0]!.name} just sold out. Please remove it from your order.`,
    };
  }

  const lines = items
    .map((item) => {
      const product = byId.get(item.productId);
      if (!product) return null;
      const size = formatMg(product.sizeMg);
      return {
        productId: product.id,
        nameSnapshot: product.name,
        sizeSnapshot: size,
        slugSnapshot: product.slug,
        unitPriceCents: product.priceCents,
        quantity: item.quantity,
        lineTotalCents: product.priceCents * item.quantity,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  if (lines.length === 0) {
    return {
      error: "Those products are no longer available. Please refresh and try again.",
    };
  }

  const subtotal = lines.reduce((n, l) => n + l.lineTotalCents, 0);
  const totals = computeTotals(subtotal);

  const order = await prisma.order.create({
    data: {
      reference: await uniqueReference(),
      customerName: d.customerName,
      email: d.email.toLowerCase(),
      phone: d.phone || null,
      organization: d.organization || null,
      addressLine1: d.addressLine1,
      addressLine2: d.addressLine2 || null,
      city: d.city,
      state: d.state || null,
      postalCode: d.postalCode,
      country: d.country,
      notes: d.notes || null,
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      totalCents: totals.totalCents,
      items: { create: lines },
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  return { reference: order.reference };
}
