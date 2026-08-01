import Link from "next/link";
import type { ReactNode } from "react";
import { PRODUCT_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/lib/format";

const dot = "h-1.5 w-1.5 rounded-full bg-current opacity-70";
const pill =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";

export function StockBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: "bg-signal-soft text-signal-deep ring-signal/25",
    LOW_STOCK: "bg-amber-soft text-amber ring-amber/25",
    SOLD_OUT: "bg-ink/8 text-muted ring-ink/12",
    DRAFT: "bg-ink/8 text-muted ring-ink/12",
  };
  return (
    <span className={`${pill} ${styles[status] ?? styles.SOLD_OUT}`}>
      <span className={dot} />
      {PRODUCT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-signal-soft text-signal-deep ring-signal/25",
    CONFIRMED: "bg-amber-soft text-amber ring-amber/25",
    PAID: "bg-signal-soft text-signal-deep ring-signal/25",
    SHIPPED: "bg-ink/8 text-ink-soft ring-ink/12",
    CANCELLED: "bg-alert-soft text-alert ring-alert/25",
  };
  return (
    <span className={`${pill} ${styles[status] ?? styles.SHIPPED}`}>
      <span className={dot} />
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {intro && (
        <p className="mt-3 text-base leading-relaxed text-muted">{intro}</p>
      )}
    </div>
  );
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors";

const buttonVariants = {
  solid: "bg-ink text-white hover:bg-signal-deep",
  outline:
    "ring-1 ring-inset ring-line text-ink-soft hover:ring-signal hover:text-signal-deep",
  ghost: "text-signal-deep hover:text-ink",
};

export function ButtonLink({
  href,
  children,
  variant = "solid",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${buttonBase} ${buttonVariants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export const buttonClass = (variant: keyof typeof buttonVariants = "solid") =>
  `${buttonBase} ${buttonVariants[variant]}`;

/** One row of the specification table on a product page. */
export function SpecRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 last:border-0 sm:flex-row sm:gap-6">
      <dt className="w-44 shrink-0 text-sm text-muted">{label}</dt>
      <dd
        className={`text-sm text-ink ${mono ? "font-mono break-all" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="max-w-md text-sm text-muted">{body}</p>
      {action}
    </div>
  );
}
