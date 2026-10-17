"use client";

// FAQ category filters. A list in the sidebar on wide screens; on phones (contact.css) one row of
// chips that scrolls sideways, fading out at whichever edge has more chips beyond it.

import { useCallback, useEffect, useRef, useState } from "react";
import { categoriesLabel, type CategoryId } from "../content/faqContent";

export interface CategoryFilter {
  id: CategoryId | "all";
  label: string;
  count: number;
}

interface FaqCategoriesProps {
  filters: CategoryFilter[];
  selected: CategoryId | "all";
  onSelect: (id: CategoryId | "all") => void;
}

export default function FaqCategories({ filters, selected, onSelect }: FaqCategoriesProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  /** Which ends still have chips scrolled out of view (always false when the row doesn't scroll). */
  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const max = list.scrollWidth - list.clientWidth;
    setEdges({ start: list.scrollLeft > 2, end: list.scrollLeft < max - 2 });
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [measure]);

  /** Slides the row so the picked chip sits in the middle, without scrolling the page. */
  const centre = (chip: HTMLElement) => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <nav className="faq__categories" aria-label={categoriesLabel}>
      <span className="field__label">{categoriesLabel}</span>
      <ul
        ref={listRef}
        className="faq__chips"
        data-fade-start={edges.start || undefined}
        data-fade-end={edges.end || undefined}
        onScroll={measure}
      >
        {filters.map(({ id, label, count }) => (
          <li key={id}>
            <button
              type="button"
              className="faq__category"
              aria-pressed={selected === id}
              disabled={count === 0 && selected !== id}
              onClick={(event) => {
                onSelect(id);
                centre(event.currentTarget.parentElement ?? event.currentTarget);
              }}
            >
              <span>{label}</span>
              <span className="faq__count mono">{count}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
