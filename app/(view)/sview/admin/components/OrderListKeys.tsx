"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keys that move between cards: →/↓/j next, ←/↑/k previous. Enter then opens the focused card. */
const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, j: 1, ArrowLeft: -1, ArrowUp: -1, k: -1 };

/**
 * Wraps the order cards so the list can be worked from the keyboard. Ignored while typing in a
 * field, so the search box keeps its arrow keys.
 */
export default function OrderListKeys({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const step = STEP[event.key];
      const target = event.target as HTMLElement;
      if (!step || event.metaKey || event.ctrlKey || event.altKey || target.closest("input, textarea, select, [contenteditable]")) return;
      const links = Array.from(ref.current?.querySelectorAll<HTMLAnchorElement>(".order-card__link") ?? []);
      if (links.length === 0) return;
      const at = links.indexOf(document.activeElement as HTMLAnchorElement);
      const next = at === -1 ? (step > 0 ? 0 : links.length - 1) : Math.min(links.length - 1, Math.max(0, at + step));
      event.preventDefault();
      links[next].focus();
      links[next].closest("li")?.scrollIntoView({ block: "nearest" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={ref}>
      {children}
    </div>
  );
}
