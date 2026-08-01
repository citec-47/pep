import "server-only";
import { prisma } from "./db";

/** Products the storefront is allowed to show (everything except DRAFT). */
const PUBLIC_WHERE = { status: { not: "DRAFT" } } as const;

const mediaSelect = {
  orderBy: { sortOrder: "asc" },
  select: { id: true, url: true, alt: true, type: true },
} as const;

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: { where: PUBLIC_WHERE } } },
    },
  });
}

export async function getFeaturedProducts(take = 4) {
  return prisma.product.findMany({
    where: { ...PUBLIC_WHERE, featured: true },
    orderBy: { createdAt: "desc" },
    take,
    include: { category: true, media: mediaSelect },
  });
}

export async function getLatestProducts(take = 8) {
  return prisma.product.findMany({
    where: PUBLIC_WHERE,
    orderBy: { createdAt: "desc" },
    take,
    include: { category: true, media: mediaSelect },
  });
}

export type ProductFilters = {
  category?: string; // category slug
  q?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
};

export async function getProducts({ category, q, sort }: ProductFilters = {}) {
  const orderBy =
    sort === "price-asc"
      ? { priceCents: "asc" as const }
      : sort === "price-desc"
        ? { priceCents: "desc" as const }
        : sort === "name"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  return prisma.product.findMany({
    where: {
      ...PUBLIC_WHERE,
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { shortDescription: { contains: q, mode: "insensitive" as const } },
              { casNumber: { contains: q, mode: "insensitive" as const } },
              { sku: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy,
    include: { category: true, media: mediaSelect },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, ...PUBLIC_WHERE },
    include: {
      category: true,
      media: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  take = 3,
) {
  return prisma.product.findMany({
    where: { ...PUBLIC_WHERE, categoryId, id: { not: excludeId } },
    orderBy: { createdAt: "desc" },
    take,
    include: { category: true, media: mediaSelect },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getOrderByReference(reference: string) {
  return prisma.order.findUnique({
    where: { reference: reference.toUpperCase().trim() },
    include: { items: true },
  });
}

/** Cart lines are validated against live DB prices. Never trust the client. */
export async function getProductsForCart(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.product.findMany({
    where: { id: { in: ids }, ...PUBLIC_WHERE },
    include: { media: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
}

export type ProductCardData = Awaited<ReturnType<typeof getLatestProducts>>[number];
export type CategoryWithCount = Awaited<ReturnType<typeof getCategories>>[number];
