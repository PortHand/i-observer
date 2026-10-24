"use client";

// Page-wide pointer effects for the website, mounted once per layout. Renders nothing:
// - Spotlight: elements with `data-spotlight` get --mx/--my, the pointer's position inside them.
// Scroll reveals need no script: they're scroll-driven CSS animations (app/globals.css).

import { useEffect } from "react";

export default function ScrollEffects() {
  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.<HTMLElement>("[data-spotlight]");
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - box.left}px`);
      card.style.setProperty("--my", `${event.clientY - box.top}px`);
    };
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => document.removeEventListener("pointermove", onPointerMove);
  }, []);

  return null;
}
