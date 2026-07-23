import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "dark" | "soft" | "danger" | "errorSoft";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[var(--shadow-primary)] hover:bg-primary-dark",
  dark: "bg-grey-800 text-white hover:bg-grey-900",
  soft: "bg-grey-500/8 text-text-primary hover:bg-grey-500/16 backdrop-blur",
  danger: "bg-error text-white hover:bg-error-dark",
  errorSoft: "bg-error/8 text-error-dark hover:bg-error/16",
};

const sizes: Record<Size, string> = {
  sm: "h-[30px] min-w-16 px-2 text-[13px] gap-1.5",
  md: "h-9 min-w-16 px-3 text-sm gap-2",
  lg: "h-10 px-4 text-[15px] gap-2",
  icon: "h-[30px] w-10 px-0",
};

export function Button({
  variant = "primary",
  size = "md",
  pill = false,
  className = "",
  children,
  ...props
}: {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${
        pill ? "rounded-full" : "rounded-[var(--radius-btn)]"
      } ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
