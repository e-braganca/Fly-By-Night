"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type MenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
};

/* Room the panel needs below the trigger before it opens upward instead. */
const FLIP_MARGIN = 8;
const PANEL_GAP = 4;

/**
 * Dropdown of actions under a trigger.
 *
 * `portal` renders the panel into <body> with fixed positioning, for menus that
 * sit inside a scrolling container (table rows) where an absolutely-positioned
 * panel would be clipped. A portalled menu opens upward when there isn't room
 * below, and closes on scroll or resize, since it no longer follows its trigger.
 */
export function Menu({
  trigger,
  items,
  align = "right",
  portal = false,
}: {
  /** Wire `toggle` straight to the trigger's onClick — a portalled menu anchors
      to the element that was clicked. */
  trigger: (props: { open: boolean; toggle: (e?: ReactMouseEvent<HTMLElement>) => void }) => ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  portal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    if (portal) {
      window.addEventListener("scroll", close, true);
      window.addEventListener("resize", close);
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, portal]);

  function toggle(e?: ReactMouseEvent<HTMLElement>) {
    if (!open && portal) setAnchor(e?.currentTarget.getBoundingClientRect() ?? null);
    setOpen((o) => !o);
  }

  const list = (
    <>
      {items.map((item, i) => (
        <button
          key={i}
          role="menuitem"
          onClick={() => {
            setOpen(false);
            item.onSelect();
          }}
          className={`flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors hover:bg-grey-500/8 ${
            item.destructive ? "text-error" : "text-text-primary"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </>
  );

  const panelClass =
    "min-w-[180px] rounded-xl bg-white p-1 shadow-[var(--shadow-dropdown)]";

  let floating: ReactNode = null;
  if (open && portal && anchor) {
    // Each item is ~36px tall plus the panel's padding.
    const estHeight = items.length * 36 + 8;
    const up = anchor.bottom + PANEL_GAP + estHeight > window.innerHeight - FLIP_MARGIN;
    floating = createPortal(
      <div
        ref={panelRef}
        role="menu"
        className={`z-[70] ${panelClass}`}
        style={{
          position: "fixed",
          ...(up
            ? { bottom: window.innerHeight - anchor.top + PANEL_GAP }
            : { top: anchor.bottom + PANEL_GAP }),
          ...(align === "right"
            ? { right: window.innerWidth - anchor.right }
            : { left: anchor.left }),
        }}
      >
        {list}
      </div>,
      document.body,
    );
  }

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle })}
      {open && !portal && (
        <div
          role="menu"
          className={`absolute z-30 mt-1 ${panelClass} ${align === "right" ? "right-0" : "left-0"}`}
        >
          {list}
        </div>
      )}
      {floating}
    </div>
  );
}
