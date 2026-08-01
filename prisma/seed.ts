/**
 * Seeds the admin user plus a starter catalogue.
 *
 * Products are seeded without media on purpose. Upload your own photos and
 * video from the admin area; until then each card shows a drawn vial. Anything
 * here is safe to edit or delete; it's a starting point, not a fixture.
 *
 *   npm run db:seed      # idempotent, re-runnable
 *   npm run db:reset     # wipe and reseed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORIES = [
  {
    name: "Metabolic",
    tagline: "GLP-1 and incretin-class research compounds.",
    description:
      "Incretin mimetics and related metabolic research compounds, supplied lyophilized with batch-specific HPLC data.",
    sortOrder: 10,
  },
  {
    name: "Repair & recovery",
    tagline: "Studied in tissue-repair and healing models.",
    description:
      "Peptides investigated in wound-healing, connective tissue and recovery research models.",
    sortOrder: 20,
  },
  {
    name: "Growth hormone secretagogues",
    tagline: "GHRH analogues and ghrelin receptor agonists.",
    description:
      "Secretagogue-class research peptides, including GHRH analogues and ghrelin receptor agonists.",
    sortOrder: 30,
  },
  {
    name: "Cosmetic & skin research",
    tagline: "Copper complexes and dermal research peptides.",
    description:
      "Peptides used in dermal and cosmetic science research, including copper tripeptide complexes.",
    sortOrder: 40,
  },
];

type SeedProduct = {
  name: string;
  category: string;
  sku: string;
  price: number; // dollars
  compareAt?: number;
  stock: number;
  status?: string;
  featured?: boolean;
  sequence?: string;
  casNumber?: string;
  molecularFormula?: string;
  molecularWeight?: number;
  purityPercent?: number;
  sizeMg?: number;
  form?: string;
  packSize?: string;
  storage?: string;
  shortDescription: string;
  description: string;
  researchNotes?: string;
};

const STORAGE_LYO =
  "Store lyophilized at −20 °C, protected from light. Reconstituted material at 2–8 °C for up to 4 weeks.";

const PRODUCTS: SeedProduct[] = [
  {
    name: "Semaglutide",
    category: "Metabolic",
    sku: "PEP-SEMA-5MG",
    price: 149,
    compareAt: 179,
    stock: 24,
    featured: true,
    casNumber: "910463-68-2",
    molecularFormula: "C187H291N45O59",
    molecularWeight: 4113.58,
    purityPercent: 99.1,
    sizeMg: 5,
    packSize: "1 vial",
    storage: STORAGE_LYO,
    shortDescription:
      "GLP-1 receptor agonist widely used in metabolic and incretin signalling research.",
    description:
      "Semaglutide is a long-acting GLP-1 receptor agonist characterised by fatty-acid acylation at position 26, which extends its half-life through albumin binding.\n\nSupplied as a sterile-filtered lyophilized powder in a sealed vial, with batch-specific HPLC and mass spectrometry data available on request.",
    researchNotes:
      "Reconstitute with bacteriostatic water down the vial wall; do not shake. Swirl gently until fully dissolved.",
  },
  {
    name: "Tirzepatide",
    category: "Metabolic",
    sku: "PEP-TIRZ-5MG",
    price: 189,
    stock: 12,
    featured: true,
    casNumber: "2023788-19-2",
    molecularFormula: "C225H348N48O68",
    molecularWeight: 4813.45,
    purityPercent: 99.3,
    sizeMg: 5,
    packSize: "1 vial",
    storage: STORAGE_LYO,
    shortDescription:
      "Dual GIP and GLP-1 receptor agonist for comparative incretin research.",
    description:
      "Tirzepatide is a dual agonist at both the GIP and GLP-1 receptors, making it a common comparator in incretin signalling studies.\n\nEach batch is analysed by HPLC and MS; the certificate of analysis ships with the order.",
  },
  {
    name: "BPC-157",
    category: "Repair & recovery",
    sku: "PEP-BPC-5MG",
    price: 59,
    compareAt: 75,
    stock: 48,
    featured: true,
    sequence: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
    casNumber: "137525-51-0",
    molecularFormula: "C62H98N16O22",
    molecularWeight: 1419.53,
    purityPercent: 99.4,
    sizeMg: 5,
    packSize: "1 vial",
    storage: STORAGE_LYO,
    shortDescription:
      "Pentadecapeptide fragment studied extensively in tissue-repair models.",
    description:
      "BPC-157 is a synthetic pentadecapeptide derived from a partial sequence of human gastric juice protein BPC. It appears widely in the connective tissue and gastrointestinal repair literature.\n\nSupplied lyophilized with mannitol as bulking agent.",
    researchNotes:
      "Highly soluble in water. Avoid repeated freeze-thaw cycles; aliquot after reconstitution.",
  },
  {
    name: "TB-500",
    category: "Repair & recovery",
    sku: "PEP-TB5-5MG",
    price: 69,
    stock: 5,
    status: "LOW_STOCK",
    molecularWeight: 4963.44,
    purityPercent: 98.8,
    sizeMg: 5,
    packSize: "1 vial",
    storage: STORAGE_LYO,
    shortDescription:
      "Synthetic thymosin beta-4 fragment used in actin-binding and repair research.",
    description:
      "TB-500 is the synthetic form of the active region of thymosin beta-4, a naturally occurring actin-sequestering peptide.\n\nSupplied lyophilized in a sealed vial under nitrogen.",
  },
  {
    name: "Ipamorelin",
    category: "Growth hormone secretagogues",
    sku: "PEP-IPA-5MG",
    price: 49,
    stock: 36,
    sequence: "Aib-His-D-2-Nal-D-Phe-Lys-NH2",
    casNumber: "170851-70-4",
    molecularFormula: "C38H49N9O5",
    molecularWeight: 711.85,
    purityPercent: 99.0,
    sizeMg: 5,
    packSize: "1 vial",
    storage: STORAGE_LYO,
    shortDescription:
      "Selective ghrelin receptor agonist and pentapeptide secretagogue.",
    description:
      "Ipamorelin is a selective growth hormone secretagogue receptor agonist, notable in the literature for its selectivity relative to earlier secretagogues.\n\nSupplied as a lyophilized powder with batch HPLC data.",
  },
  {
    name: "CJC-1295 (no DAC)",
    category: "Growth hormone secretagogues",
    sku: "PEP-CJC-2MG",
    price: 44,
    stock: 21,
    casNumber: "863288-34-0",
    molecularFormula: "C152H252N44O42",
    molecularWeight: 3367.9,
    purityPercent: 98.9,
    sizeMg: 2,
    packSize: "1 vial",
    storage: STORAGE_LYO,
    shortDescription:
      "Modified GRF (1-29) analogue used as a GHRH research standard.",
    description:
      "CJC-1295 without DAC, also catalogued as Modified GRF (1-29), is a tetrasubstituted GHRH analogue used as a reference in secretagogue research.\n\nSupplied lyophilized; reconstitute immediately before use.",
  },
  {
    name: "GHK-Cu",
    category: "Cosmetic & skin research",
    sku: "PEP-GHKCU-50MG",
    price: 39,
    stock: 60,
    sequence: "Gly-His-Lys · Cu(II)",
    casNumber: "49557-75-7",
    molecularFormula: "C14H22CuN6O4",
    molecularWeight: 403.93,
    purityPercent: 99.0,
    sizeMg: 50,
    packSize: "1 vial",
    storage:
      "Store at −20 °C, protected from light. The copper complex is light-sensitive in solution.",
    shortDescription:
      "Copper tripeptide complex, a standard in dermal and matrix research.",
    description:
      "GHK-Cu is the copper(II) complex of the tripeptide glycyl-L-histidyl-L-lysine, one of the most studied peptides in dermal matrix and wound research.\n\nCharacteristic deep blue powder. Colour intensity is normal batch variation and not a purity indicator.",
    researchNotes:
      "Solutions are light-sensitive, so store reconstituted material in amber vials.",
  },
  {
    name: "Thymosin alpha-1",
    category: "Repair & recovery",
    sku: "PEP-TA1-5MG",
    price: 79,
    stock: 0,
    status: "SOLD_OUT",
    casNumber: "62304-98-7",
    molecularFormula: "C129H215N33O55",
    molecularWeight: 3108.3,
    purityPercent: 98.7,
    sizeMg: 5,
    packSize: "1 vial",
    storage: STORAGE_LYO,
    shortDescription:
      "28-amino-acid peptide studied in immunological research models.",
    description:
      "Thymosin alpha-1 is a 28-amino-acid acetylated peptide originally isolated from thymosin fraction 5, appearing widely in immunological research.\n\nCurrently between batches; the next lot is in QC.",
  },
];

async function main() {
  /* ------------------------------ Admin user ----------------------------- */
  const email = (process.env.ADMIN_EMAIL ?? "admin@pep.test").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`✓ admin user  ${email}`);

  /* ------------------------------ Categories ----------------------------- */
  const categoryIds = new Map<string, string>();
  for (const c of CATEGORIES) {
    const slug = slugify(c.name);
    const row = await prisma.category.upsert({
      where: { slug },
      update: {
        name: c.name,
        tagline: c.tagline,
        description: c.description,
        sortOrder: c.sortOrder,
      },
      create: { ...c, slug },
    });
    categoryIds.set(c.name, row.id);
  }
  console.log(`✓ ${CATEGORIES.length} categories`);

  /* ------------------------------- Products ------------------------------ */
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const categoryId = categoryIds.get(p.category);
    if (!categoryId) throw new Error(`Unknown category: ${p.category}`);

    const data = {
      name: p.name,
      categoryId,
      sku: p.sku,
      priceCents: Math.round(p.price * 100),
      compareAtCents: p.compareAt ? Math.round(p.compareAt * 100) : null,
      stock: p.stock,
      status: p.status ?? "AVAILABLE",
      featured: p.featured ?? false,
      sequence: p.sequence ?? null,
      casNumber: p.casNumber ?? null,
      molecularFormula: p.molecularFormula ?? null,
      molecularWeight: p.molecularWeight ?? null,
      purityPercent: p.purityPercent ?? null,
      sizeMg: p.sizeMg ?? null,
      form: p.form ?? "Lyophilized powder",
      packSize: p.packSize ?? null,
      storage: p.storage ?? null,
      shortDescription: p.shortDescription,
      description: p.description,
      researchNotes: p.researchNotes ?? null,
    };

    await prisma.product.upsert({
      where: { slug },
      update: data,
      create: { ...data, slug },
    });
  }
  console.log(`✓ ${PRODUCTS.length} products`);

  /* ---------------------------- A sample order --------------------------- */
  const existingOrder = await prisma.order.findUnique({
    where: { reference: "PEP-SAMPLE" },
  });

  if (!existingOrder) {
    const bpc = await prisma.product.findUnique({ where: { slug: "bpc-157" } });
    const ipa = await prisma.product.findUnique({ where: { slug: "ipamorelin" } });

    if (bpc && ipa) {
      const lines = [
        {
          productId: bpc.id,
          nameSnapshot: bpc.name,
          sizeSnapshot: "5 mg",
          slugSnapshot: bpc.slug,
          unitPriceCents: bpc.priceCents,
          quantity: 2,
          lineTotalCents: bpc.priceCents * 2,
        },
        {
          productId: ipa.id,
          nameSnapshot: ipa.name,
          sizeSnapshot: "5 mg",
          slugSnapshot: ipa.slug,
          unitPriceCents: ipa.priceCents,
          quantity: 1,
          lineTotalCents: ipa.priceCents,
        },
      ];
      const subtotal = lines.reduce((n, l) => n + l.lineTotalCents, 0);
      const shipping = subtotal >= 30_000 ? 0 : 2_500;

      await prisma.order.create({
        data: {
          reference: "PEP-SAMPLE",
          customerName: "Dr. Alex Moreau",
          email: "a.moreau@example.org",
          phone: "+1 555 010 0142",
          organization: "Meridian Research Labs",
          addressLine1: "140 Chemin Way",
          addressLine2: "Building B, Lab 4",
          city: "Cambridge",
          state: "MA",
          postalCode: "02142",
          country: "United States",
          notes: "Please include the COA for both batches.",
          subtotalCents: subtotal,
          shippingCents: shipping,
          totalCents: subtotal + shipping,
          status: "NEW",
          items: { create: lines },
        },
      });
      console.log("✓ sample order  PEP-SAMPLE");
    }
  }

  console.log("\nDone. Sign in at /admin/login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
