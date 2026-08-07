import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

/*
  Landing-only button. Mirrors the shape of components/ui/Button.tsx but draws
  its colours from the landing's `--l-*` palette vars, and renders a link when
  `href` is passed — internal routes go through next/link, `tel:`/`sms:`/#anchor
  targets stay plain anchors.
*/

type Variant = "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

/* Sizes mirror the Figma Button component: 8px (sm) / 16px horizontal padding,
   8px gap, and 30px (sm) / 36px (md) / 48px (lg) tall. */
const sizes: Record<Size, string> = {
  sm: "h-[30px] px-2 text-[13px] gap-2",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-12 px-4 text-[15px] gap-2",
};

const base =
  "inline-flex items-center justify-center font-semibold transition-[background,color,border-color,transform] duration-150 disabled:opacity-50 disabled:pointer-events-none";

const variantStyles: Record<Variant, string> = {
  accent:
    "text-[var(--l-on-accent)] bg-[var(--l-accent)] hover:bg-[var(--l-accent-strong)] hover:-translate-y-0.5",
  outline:
    "text-[var(--l-accent)] bg-transparent border border-[var(--l-accent-border)] hover:border-[var(--l-accent)] hover:bg-[var(--l-accent-soft)]",
  ghost: "text-[var(--l-muted)] bg-transparent hover:text-[var(--l-accent)]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
  className?: string;
  children?: ReactNode;
};

export function Button({
  variant = "accent",
  size = "md",
  // The Figma Button uses a single 8px radius token (`--radius-btn`) — not a
  // pill. Opt in explicitly if a pill is ever wanted.
  pill = false,
  className = "",
  children,
  href,
  ...props
}: CommonProps &
  { href?: string } & Partial<
    ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>
  >) {
  const cls = `${base} ${pill ? "rounded-full" : "rounded-[var(--radius-btn)]"} ${variantStyles[variant]} ${sizes[size]} ${className}`;

  if (href !== undefined) {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    // Only in-app routes get client-side navigation.
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={cls} {...anchorProps}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={cls} {...anchorProps}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
