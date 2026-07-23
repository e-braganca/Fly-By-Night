"use client";

import { useEffect, useState, type ReactNode } from "react";

const DURATION = 300; // ms — keep in sync with the transition classes below

/** Right-anchored slide-over panel with overlay, ESC-to-close and scroll lock.
    Animates in/out with a slide + fade; stays mounted through the exit. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  headerActions,
  footer,
  headerBorder = false,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  headerBorder?: boolean;
  width?: number;
}) {
  // `mounted` keeps the node in the DOM during the exit animation;
  // `shown` drives the enter/exit transition (open = slid in, closed = slid out).
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Next frame: flip to the "in" state so the transition runs.
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    // Closing: play the exit transition, then unmount.
    setShown(false);
    const id = setTimeout(() => setMounted(false), DURATION);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-grey-900/40 transition-opacity duration-300 ease-out ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex h-full w-full flex-col bg-white shadow-[var(--shadow-dropdown)] transition-transform duration-300 ease-out will-change-transform ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between py-4 pl-5 pr-2 ${
            headerBorder ? "border-b border-divider" : ""
          }`}
        >
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <div className="flex items-center gap-3">
            {headerActions}
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/8"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && <div className="px-6 py-6">{footer}</div>}
      </div>
    </div>
  );
}
