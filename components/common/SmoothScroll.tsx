"use client";

// Eases mouse-wheel and trackpad scrolling of the page (Lenis), so it glides instead of jumping in
// steps. Touch screens keep their own native scrolling. Rendered once, in the root layout.
//
// - Areas that scroll on their own (tables, menus, dialogs, the date picker's columns) scroll
//   natively first (allowNestedScroll); add data-lenis-prevent to opt any other element out.
// - In-page "#section" links glide too, stopping below the sticky header (Lenis reads the page's
//   scroll-padding-top).
// - Off for visitors who ask their system for reduced motion.

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      // How quickly the page catches up with the wheel: lower is smoother and floatier.
      lerp: 0.1,
      anchors: true,
      allowNestedScroll: true,
      // A click that leaves the page shouldn't carry the glide over to the next one.
      stopInertiaOnNavigate: true,
    });
    return () => lenis.destroy();
  }, []);

  return null;
}
