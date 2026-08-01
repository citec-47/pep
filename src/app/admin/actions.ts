"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  verifyCredentials,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";
import {
  loginSchema,
  productSchema,
  categorySchema,
  slugify,
} from "@/lib/validation";
import { ORDER_STATUS_LABELS } from "@/lib/format";

type ActionState = { error?: string } | undefined;

/* --------------------------------- Auth --------------------------------- */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return { error: "Those credentials don't match. Please try again." };
  }

  await createSession(user.id, user.email);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------ Guard helper ---------------------------- */

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/* ------------------------------- Helpers -------------------------------- */

/**
 * Media items come in as hidden inputs named "media" with the value encoded
 * as `type::url` (type is "image" or "video").
 */
function parseMedia(formData: FormData) {
  return formData
    .getAll("media")
    .filter((v): v is string => typeof v === "string" && v.includes("::"))
    .map((entry, i) => {
      const sep = entry.indexOf("::");
      const type = entry.slice(0, sep) === "video" ? "video" : "image";
      const url = entry.slice(sep + 2);
      return { url, type, sortOrder: i };
    })
    .filter((m) => m.url.length > 0);
}

/** Build a slug from a name, bumping a suffix until it's free. */
async function uniqueSlug(
  table: "product" | "category",
  name: string,
  exceptId?: string,
) {
  const base = slugify(name) || table;
  let slug = base;
  let n = 2;
  while (true) {
    const clash =
      table === "product"
        ? await prisma.product.findUnique({ where: { slug } })
        : await prisma.category.findUnique({ where: { slug } });
    if (!clash || clash.id === exceptId) return slug;
    slug = `${base}-${n++}`;
  }
}

/** Storefront pages that depend on the catalogue. */
function revalidateCatalogue(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/products/${slug}`);
}

/* ------------------------------- Products ------------------------------- */

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    sku: formData.get("sku"),
    price: formData.get("price"),
    compareAt: formData.get("compareAt"),
    stock: formData.get("stock"),
    status: formData.get("status"),
    featured:
      formData.get("featured") === "on" || formData.get("featured") === "true",
    sequence: formData.get("sequence"),
    casNumber: formData.get("casNumber"),
    molecularFormula: formData.get("molecularFormula"),
    molecularWeight: formData.get("molecularWeight"),
    purityPercent: formData.get("purityPercent"),
    sizeMg: formData.get("sizeMg"),
    form: formData.get("form"),
    packSize: formData.get("packSize"),
    storage: formData.get("storage"),
    coaUrl: formData.get("coaUrl"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    researchNotes: formData.get("researchNotes"),
  });
}

/** Map the validated form onto Prisma's column shape. */
function productData(d: NonNullable<ReturnType<typeof parseProductForm>["data"]>) {
  return {
    name: d.name,
    categoryId: d.categoryId,
    sku: d.sku || null,
    priceCents: Math.round(d.price * 100),
    compareAtCents:
      d.compareAt === undefined ? null : Math.round(d.compareAt * 100),
    stock: d.stock,
    status: d.status,
    featured: !!d.featured,
    sequence: d.sequence || null,
    casNumber: d.casNumber || null,
    molecularFormula: d.molecularFormula || null,
    molecularWeight: d.molecularWeight ?? null,
    purityPercent: d.purityPercent ?? null,
    sizeMg: d.sizeMg ?? null,
    form: d.form,
    packSize: d.packSize || null,
    storage: d.storage || null,
    coaUrl: d.coaUrl || null,
    shortDescription: d.shortDescription || "",
    description: d.description || "",
    researchNotes: d.researchNotes || null,
  };
}

/** Postgres unique-violation on `sku` is the only clash we expect here. */
function skuClashMessage(err: unknown, sku: string | null) {
  const code = (err as { code?: string })?.code;
  if (code === "P2002" && sku) {
    return `SKU “${sku}” is already used by another product.`;
  }
  return null;
}

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const data = productData(parsed.data);
  const media = parseMedia(formData);
  let slug: string;

  try {
    const created = await prisma.product.create({
      data: {
        ...data,
        slug: await uniqueSlug("product", data.name),
        media: {
          create: media.map((m) => ({
            url: m.url,
            type: m.type,
            alt: `${data.name} ${m.type} ${m.sortOrder + 1}`,
            sortOrder: m.sortOrder,
          })),
        },
      },
    });
    slug = created.slug;
  } catch (err) {
    const clash = skuClashMessage(err, data.sku);
    if (clash) return { error: clash };
    throw err;
  }

  revalidateCatalogue(slug);
  redirect("/admin/products");
}

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing product id." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const data = productData(parsed.data);
  const media = parseMedia(formData);
  let slug: string;

  try {
    // Replace the media set wholesale, since the form always submits the full list.
    const [, updated] = await prisma.$transaction([
      prisma.productMedia.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          ...data,
          slug: await uniqueSlug("product", data.name, id),
          media: {
            create: media.map((m) => ({
              url: m.url,
              type: m.type,
              alt: `${data.name} ${m.type} ${m.sortOrder + 1}`,
              sortOrder: m.sortOrder,
            })),
          },
        },
      }),
    ]);
    slug = updated.slug;
  } catch (err) {
    const clash = skuClashMessage(err, data.sku);
    if (clash) return { error: clash };
    throw err;
  }

  revalidateCatalogue(slug);
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  await prisma.product.delete({ where: { id } });
  revalidateCatalogue(product.slug);
}

/* ------------------------------ Categories ------------------------------ */

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    heroImage: formData.get("heroImage"),
    sortOrder: formData.get("sortOrder") || 0,
  });
}

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  await prisma.category.create({
    data: {
      name: d.name,
      tagline: d.tagline || "",
      description: d.description || "",
      heroImage: d.heroImage || null,
      sortOrder: d.sortOrder ?? 0,
      slug: await uniqueSlug("category", d.name),
    },
  });

  revalidatePath("/admin/categories");
  revalidateCatalogue();
  redirect("/admin/categories");
}

export async function updateCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing category id." };

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  await prisma.category.update({
    where: { id },
    data: {
      name: d.name,
      tagline: d.tagline || "",
      description: d.description || "",
      heroImage: d.heroImage || null,
      sortOrder: d.sortOrder ?? 0,
      slug: await uniqueSlug("category", d.name, id),
    },
  });

  revalidatePath("/admin/categories");
  revalidateCatalogue();
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  // Products reference the category with onDelete: Restrict, so say so plainly
  // rather than letting Prisma throw.
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    redirect(
      `/admin/categories?error=${encodeURIComponent(
        `That category still holds ${count} product${count === 1 ? "" : "s"}. Move or delete them first.`,
      )}`,
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidateCatalogue();
}

/* -------------------------------- Orders -------------------------------- */

export async function setOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || typeof status !== "string") return;
  if (!(status in ORDER_STATUS_LABELS)) return;

  const order = await prisma.order.update({ where: { id }, data: { status } });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/orders/${order.reference}`);
  revalidatePath("/admin");
}

export async function saveOrderNotesAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const notes = formData.get("adminNotes");
  if (typeof id !== "string") return;

  await prisma.order.update({
    where: { id },
    data: { adminNotes: typeof notes === "string" && notes.trim() ? notes.trim() : null },
  });

  revalidatePath(`/admin/orders/${id}`);
}

export async function deleteOrderAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect("/admin/orders");
}
