"use client";

import { useEffect, useState, type ReactNode } from "react";

const DURATION = 300; // ms — keep in sync with the transition classes below

/** Centered dialog on desktop; bottom sheet that slides up on mobile. Animates
    in/out with a slide + fade and stays mounted through the exit transition. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  headerActions,
  bodyClassName = "px-6 py-2",
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  bodyClassName?: string;
  width?: number;
}) {
  // `mounted` keeps the node in the DOM during the exit animation;
  // `shown` drives the enter/exit transition.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
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
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ease-out sm:items-center sm:p-4 ${
        shown ? "bg-grey-900/40 opacity-100" : "bg-grey-900/0 opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[var(--shadow-dropdown)] transition-transform duration-300 ease-out will-change-transform sm:rounded-2xl ${
          shown ? "translate-y-0" : "translate-y-full sm:translate-y-4"
        }`}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 pb-2 pt-6">
          <h2 className="flex-1 text-lg font-semibold text-text-primary">{title}</h2>
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

        <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 px-6 pb-6 pt-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
