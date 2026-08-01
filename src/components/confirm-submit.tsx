"use client";

/**
 * A submit button that asks first. Used for destructive admin actions so a
 * stray click can't wipe a product or an order.
 */
export function ConfirmSubmit({
  message,
  children,
  className = "",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
