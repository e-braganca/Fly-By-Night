import type { ReactNode } from "react";

export function Avatar({
  size = 40,
  src,
  alt = "",
  fallback,
  className = "",
}: {
  size?: number;
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-grey-300 text-grey-600 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </span>
  );
}
