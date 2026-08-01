import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(80),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  heroImage: z.string().trim().max(500).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

/**
 * Blank -> undefined, so optional numeric fields can be left empty. A missing
 * form field arrives as null, which must not coerce to 0.
 */
const optionalNumber = z
  .union([z.literal(""), z.null(), z.coerce.number()])
  .optional()
  .transform((v) =>
    v === "" || v === null || v === undefined ? undefined : Number(v),
  );

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(140),
  categoryId: z.string().min(1, "Choose a category."),
  sku: z.string().trim().max(60).optional().or(z.literal("")),

  price: z.coerce
    .number()
    .min(0, "Price must be zero or more.")
    .max(1_000_000, "That price looks too large."),
  compareAt: optionalNumber.pipe(
    z.number().min(0).max(1_000_000).optional(),
  ),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  status: z.enum(["AVAILABLE", "LOW_STOCK", "SOLD_OUT", "DRAFT"]),
  featured: z.coerce.boolean().optional(),

  sequence: z.string().trim().max(2000).optional().or(z.literal("")),
  casNumber: z.string().trim().max(40).optional().or(z.literal("")),
  molecularFormula: z.string().trim().max(120).optional().or(z.literal("")),
  molecularWeight: optionalNumber.pipe(z.number().min(0).max(1_000_000).optional()),
  purityPercent: optionalNumber.pipe(z.number().min(0).max(100).optional()),
  sizeMg: optionalNumber.pipe(z.number().min(0).max(100_000).optional()),
  form: z.string().trim().min(1, "Form is required.").max(80),
  packSize: z.string().trim().max(80).optional().or(z.literal("")),
  storage: z.string().trim().max(300).optional().or(z.literal("")),
  coaUrl: z.string().trim().max(500).optional().or(z.literal("")),

  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(6000).optional().or(z.literal("")),
  researchNotes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ProductInput = z.infer<typeof productSchema>;

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your full name.").max(140),
  email: z.string().trim().email("That doesn't look like a valid email."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  organization: z.string().trim().max(140).optional().or(z.literal("")),

  addressLine1: z.string().trim().min(3, "Street address is required.").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required.").max(120),
  state: z.string().trim().max(120).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "Postal code is required.").max(40),
  country: z.string().trim().min(2, "Country is required.").max(120),

  notes: z.string().trim().max(2000).optional().or(z.literal("")),

  researchUse: z.literal(true, {
    message: "Please confirm the research-use terms to place your order.",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Turn a name into a URL-safe slug: "BPC-157" -> "bpc-157". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alikes

/** "PEP-7QK3M2": short enough to read over the phone, random enough to not guess. */
export function generateOrderReference(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += REF_ALPHABET[b % REF_ALPHABET.length];
  return `PEP-${out}`;
}
