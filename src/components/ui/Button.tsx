import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-[var(--shadow-soft)]",
  secondary:
    "border-2 border-[var(--accent)] bg-white text-[var(--accent)] hover:bg-[var(--accent-soft)]",
  ghost:
    "text-[var(--foreground)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
};

type BaseProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = BaseProps &
  ComponentProps<"button"> & { href?: never };

type LinkButtonProps = BaseProps &
  ComponentProps<typeof Link> & { href: string };

const baseClass =
  "touch-target inline-flex items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors sm:text-base";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  href,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
