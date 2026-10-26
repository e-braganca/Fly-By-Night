"use client";

import { useEffect, useRef } from "react";

/**
 * Lets an ordinary mouse wheel scroll a wide table sideways.
 *
 * A wheel only sends vertical deltas, so without this the hidden columns are
 * reachable only by dragging the scrollbar or holding Shift. Over the element,
 * vertical wheel movement is turned into horizontal scrolling until the table
 * reaches its edge — from there the wheel scrolls the page as usual, so the
 * cursor never gets stuck. Sideways input (trackpad swipes, Shift+wheel) and
 * pinch-zoom are left to the browser.
 *
 * The listener is attached by hand because React's onWheel is passive and
 * can't stop the page from scrolling at the same time.
 */
export function useWheelScrollX<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;

      // Line- and page-based deltas (some mice, Firefox) arrive in other units.
      const delta =
        e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * el.clientWidth : e.deltaY;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 1;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

      e.preventDefault();
      el.scrollLeft = Math.min(max, Math.max(0, el.scrollLeft + delta));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}
