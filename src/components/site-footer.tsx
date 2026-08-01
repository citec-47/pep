import Link from "next/link";
import { Logo } from "./logo";

const STORE_EMAIL = process.env.NEXT_PUBLIC_STORE_EMAIL ?? "orders@example.com";
const STORE_WHATSAPP = process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface sm:mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:px-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Research-grade peptides and reference standards, photographed batch
            by batch, with specifications published in full.
          </p>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-ink">Catalogue</h3>
          <FooterLink href="/products">All products</FooterLink>
          <FooterLink href="/products?sort=price-asc">Lowest price</FooterLink>
          <FooterLink href="/orders">Track an order</FooterLink>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-ink">Company</h3>
          <FooterLink href="/about">About &amp; terms</FooterLink>
          <FooterLink href="/admin">Admin sign in</FooterLink>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-ink">Talk to us</h3>
          <a
            href={`mailto:${STORE_EMAIL}`}
            className="block text-sm text-muted transition-colors hover:text-signal-deep"
          >
            {STORE_EMAIL}
          </a>
          {STORE_WHATSAPP && (
            <p className="text-sm text-muted">{STORE_WHATSAPP}</p>
          )}
          <p className="text-xs leading-relaxed text-muted">
            Orders are placed as requests. We confirm stock and send payment
            instructions by email.
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:px-6 lg:px-8 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} PeptideLab. All products are sold for
            laboratory research use only.
          </p>
          <p className="font-mono">Not for human consumption.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block text-sm text-muted transition-colors hover:text-signal-deep"
    >
      {children}
    </Link>
  );
}
