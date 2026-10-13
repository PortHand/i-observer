"use client";

// Disclosure list (WAI-ARIA accordion pattern): each heading holds a button that shows or hides its
// panel. Closed panels stay in the DOM for the height animation but are `inert`, so they can't be
// focused or read. Styles live in app/globals.css under "Accordion".

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";

export interface AccordionItem {
  /** Unique within the page; used for element ids. */
  id: string;
  title: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Let several panels stay open at once (default) or close the others on open. */
  allowMultiple?: boolean;
  defaultOpen?: string[];
  /** Heading level wrapping each button, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
}

export default function Accordion({ items, allowMultiple = true, defaultOpen = [], headingLevel = 3 }: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const Heading = `h${headingLevel}` as const;

  const toggle = (id: string) =>
    setOpen((current) => {
      if (current.includes(id)) return current.filter((openId) => openId !== id);
      return allowMultiple ? [...current, id] : [id];
    });

  return (
    <div className="accordion">
      {items.map(({ id, title, content }) => {
        const isOpen = open.includes(id);
        return (
          <div key={id} className={isOpen ? "accordion__item accordion__item--open" : "accordion__item"}>
            <Heading className="accordion__heading">
              <button
                type="button"
                id={`${id}-button`}
                className="accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                onClick={() => toggle(id)}
              >
                <span>{title}</span>
                <Plus className="icon accordion__icon" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </Heading>
            <div
              id={`${id}-panel`}
              className="accordion__panel"
              role="region"
              aria-labelledby={`${id}-button`}
              inert={!isOpen}
            >
              <div className="accordion__content">
                <div className="accordion__body">{content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
