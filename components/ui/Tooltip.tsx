"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/*
  Hover/focus tooltip.

  The panel is portalled to <body> and positioned `fixed` from the trigger's
  bounding rect. That matters here: the tables live inside a horizontally
  scrolling container, and a container that scrolls on one axis clips the other
  too — an absolutely-positioned panel would be cut off by the row.

  It opens on focus as well as hover, so the breakdown is reachable from the
  keyboard.
*/

const GAP = 8;

export function Tooltip({
  content,
  children,
  className = "",
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  const open = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setRect(r);
  };
  const close = () => setRect(null);

  // Prefer above the trigger; flip below when the top of the viewport is close.
  const below = rect ? rect.top < 160 : false;

  return (
    <>
      <span
        ref={ref}
        tabIndex={0}
        aria-describedby={rect ? id : undefined}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        className={`cursor-help rounded outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
      >
        {children}
      </span>

      {rect &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            style={{
              position: "fixed",
              left: rect.left + rect.width / 2,
              top: below ? rect.bottom + GAP : rect.top - GAP,
              transform: below ? "translate(-50%, 0)" : "translate(-50%, -100%)",
            }}
            className="pointer-events-none z-[60] w-max max-w-[260px] rounded-lg bg-grey-900 px-3 py-2 text-xs text-white shadow-[var(--shadow-dropdown)]"
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
