import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white transition-colors group-hover:bg-signal-deep">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {/* A simple vial mark. */}
          <path d="M9 3h6M10 3v6.2L5.6 17.4A2.6 2.6 0 0 0 7.9 21h8.2a2.6 2.6 0 0 0 2.3-3.6L14 9.2V3" />
          <path d="M7.4 14h9.2" />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        Peptide<span className="text-signal-deep">Lab</span>
      </span>
    </Link>
  );
}
