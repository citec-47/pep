"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { useCart } from "./cart-provider";

const NAV = [
  { href: "/products", label: "Catalogue" },
  { href: "/orders", label: "Track order" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count, ready } = useCart();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-surface text-ink shadow-[var(--shadow-soft)]"
                  : "text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          aria-label={`Your order, ${ready ? count : 0} item${count === 1 ? "" : "s"}`}
          className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-signal-deep sm:px-4 md:ml-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 6h15l-1.6 9.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.7L5.4 3.6A1 1 0 0 0 4.4 3H2" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <span className="hidden sm:inline">Cart</span>
          <span className="min-w-5 rounded-full bg-white/20 px-1.5 text-center text-xs tabular-nums">
            {ready ? count : 0}
          </span>
        </Link>
      </div>

      {/* Nav moves to its own scrollable row on narrow screens. */}
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 sm:px-6 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive(item.href) ? "bg-surface text-ink" : "text-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
