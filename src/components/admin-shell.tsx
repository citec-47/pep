"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    exact: true,
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <>
        <path d="M9 3h6M10 3v5.5L6 17.5A2.5 2.5 0 0 0 8.3 21h7.4a2.5 2.5 0 0 0 2.3-3.5L14 8.5V3" />
        <path d="M7.5 14h9" />
      </>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: (
      <>
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3l2 2.5h8A2.5 2.5 0 0 1 21 10v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <>
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
  },
];

export function AdminShell({
  email,
  logout,
  children,
}: {
  email: string;
  logout: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  // Escape closes the drawer. Registering a listener is fine here; the state
  // only changes from inside the callback.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex min-h-screen bg-base">
      {/* Dimmer behind the drawer, small screens only. */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ----------------------------- Sidebar ---------------------------- */}
      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-line bg-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-line px-5">
          <Logo href="/admin" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="-mr-1 rounded-lg p-1.5 text-muted hover:text-ink lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-2 pt-2 pb-1 font-mono text-[10px] tracking-widest text-muted uppercase">
            Manage
          </p>
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-white"
                    : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                  aria-hidden
                >
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-line p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
              <path d="M14 4h6v6M20 4l-8.5 8.5" />
              <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
            </svg>
            View storefront
          </Link>

          <div className="rounded-lg bg-surface-2 px-3 py-2.5">
            <p className="font-mono text-[10px] tracking-widest text-muted uppercase">
              Signed in
            </p>
            <p className="mt-0.5 truncate text-sm text-ink" title={email}>
              {email}
            </p>
            <form action={logout} className="mt-2">
              <button
                type="submit"
                className="w-full rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-alert hover:text-alert"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ------------------------------ Content --------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Bar that carries the menu button on small screens. */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-base/90 px-4 backdrop-blur sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="admin-sidebar"
            className="-ml-1 rounded-lg p-2 text-ink-soft hover:bg-surface-2 hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Logo href="/admin" />
        </header>

        <main className="w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
