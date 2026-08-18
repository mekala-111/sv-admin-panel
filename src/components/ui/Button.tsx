import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "gradient";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "border-none bg-[var(--color-primary)] font-bold",
  secondary:
    "border border-[var(--color-border)] bg-white text-[var(--color-text)] font-semibold",
  danger:
    "border border-[var(--color-border)] bg-white text-[var(--color-danger)] font-semibold",
  gradient:
    "border-none font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]",
};

const WHITE: CSSProperties = { color: "#fff" };

export function Button({
  children,
  variant = "secondary",
  href,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  type?: "button" | "submit";
  className?: string;
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-[9px] px-4 py-2.5 text-[13px] ${VARIANT_CLASSES[variant]} ${className}`;
  const style = variant === "primary" || variant === "gradient" ? WHITE : undefined;
  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} style={style}>
      {children}
    </button>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-3 inline-block text-[13px] font-semibold"
      style={{ color: "var(--color-text-muted)" }}
    >
      &larr; {label}
    </Link>
  );
}
