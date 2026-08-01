# PeptideLab

A peptide catalogue and order desk. **Only the admin can publish products.**
Buyers browse, build an order and submit it as a request. No payment is taken
online.

Built with Next.js 16 (App Router), Prisma + Postgres, Cloudinary for image and
video uploads, and Tailwind 4.

---

## Quick start

```bash
npm install
npm run db:push      # create the tables
npm run db:seed      # admin user + starter catalogue
npm run dev
```

Storefront: <http://localhost:3000> · Admin: <http://localhost:3000/admin/login>

Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. **Change both
before deploying anywhere public**, along with `AUTH_SECRET`.

---

## Product imagery

Products with no uploaded photo fall back to a drawn vial from
`components/product-artwork.tsx`. The colour is derived from the product slug,
so each item is consistent and the catalogue reads as a set rather than a wall
of grey boxes. Upload a real photo and the drawing disappears on its own.

Uploads go through `POST /api/admin/upload`, which requires an admin session.
That route is the only write path for media.

---

## How it fits together

```
src/
  app/
    (site)/                 storefront, public
      page.tsx              home: spotlight, catalogue row, categories, ordering
      products/             catalogue grid with category, search and sort
      products/[slug]/      gallery, specification table, add to order
      cart/                 review order (localStorage)
      checkout/             shipping details, places the order
      orders/               track by reference code
      orders/[reference]/   order status page for the buyer
      about/                ordering process and research-use terms
      actions.ts            placeOrderAction
    admin/
      login/                sign in
      (protected)/          everything here requires a session
        page.tsx            dashboard: counts, recent orders, low stock
        products/           list, new, [id]/edit
        categories/         list, new, [id]/edit
        orders/             list and [id] detail, status control, notes
      actions.ts            all admin server actions
    api/admin/upload/       Cloudinary upload, admin session required
  components/               forms, cart, gallery, uploader, artwork, shell, ui
  lib/
    auth.ts                 JWT session cookie (jose) + bcrypt
    data.ts                 storefront queries
    db.ts                   Prisma client singleton
    pricing.ts              shipping rules
    validation.ts           zod schemas, slugify, order reference
```

### Data model

`Category → Product → ProductMedia` for the catalogue, `Order → OrderItem` for
orders, plus `AdminUser`.

Order items snapshot the product name, size, slug and unit price, so deleting a
product never corrupts order history.

---

## The order flow

1. Buyer adds vials to their order. It lives in `localStorage`; no account
   needed.
2. Checkout collects contact and shipping details plus a research-use
   confirmation.
3. The server re-prices every line from the database. Client prices are never
   trusted. The order is created with a reference like `PEP-7QK3M2`.
4. The buyer lands on `/orders/PEP-7QK3M2` and can revisit it any time.
5. You work the order in `/admin/orders`: `NEW → CONFIRMED → PAID → SHIPPED`,
   or `CANCELLED`. Status changes are visible to the buyer immediately.

Stock is not decremented automatically. You adjust it when you confirm an
order, since orders are requests rather than paid checkouts.

---

## Admin notes

- Products save with the media list shown in the form. The first item is the
  card cover; the arrows reorder.
- Files upload as soon as you pick them, but nothing is attached to the product
  until you hit **Save changes**.
- `DRAFT` status hides a product from the storefront entirely.
- A category holding products cannot be deleted. Move them first.
- Deleting a product keeps past orders intact. The line then reads "product
  since deleted".

---

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | Postgres, pooled and direct |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` / `_UPLOAD_PRESET` | Media uploads |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin login |
| `AUTH_SECRET` | Session signing key, long random string in production |
| `NEXT_PUBLIC_STORE_EMAIL` / `_WHATSAPP` | Contact details shown on the site |

Copy `.env.example` to `.env` to start. `.env` is gitignored and must stay that
way.

---

## Compliance

Every product page, the checkout and the footer carry a research-use-only
notice, and checkout requires an explicit confirmation before an order can be
placed. That is deliberate. Keep it.

Note that mainstream card processors generally prohibit research-peptide sales.
That is why this build takes no payment online: orders are requests, and
payment is arranged with the buyer directly.
