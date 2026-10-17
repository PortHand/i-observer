"use client";

// The section links on tablets and phones, where the header has no room for them: a menu button
// that opens a sheet filling the window below the header. Escape, a link or widening the window
// closes it; the page behind doesn't scroll while it's open.

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Mail, Menu, X } from "lucide-react";
import { appInfo, mobileMenu, navLinks } from "../content/homeContent";

export default function MobileNav({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  /** Where the header ends, so the sheet starts right under it whether or not the utility bar shows. */
  const [top, setTop] = useState(0);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    // Widening past the breakpoint hides the button; don't leave the sheet open behind it.
    const wide = window.matchMedia("(min-width: 981px)");
    const onWide = () => wide.matches && setOpen(false);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const close = () => setOpen(false);
  const toggle = () => {
    if (!open) setTop(toggleRef.current?.closest(".nav")?.getBoundingClientRect().bottom ?? 0);
    setOpen((value) => !value);
  };
  const Icon = open ? X : Menu;

  return (
    <div className={open ? "mobile-nav mobile-nav--open" : "mobile-nav"}>
      <button
        ref={toggleRef}
        type="button"
        className="mobile-nav__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? mobileMenu.close : mobileMenu.open}
        onClick={toggle}
      >
        <Icon className="icon" strokeWidth={1.75} />
      </button>

      <nav
        id={panelId}
        className="mobile-nav__panel"
        aria-label={mobileMenu.label}
        hidden={!open}
        style={{ top }}
      >
        <div className="container mobile-nav__inner">
          <span className="eyebrow">{mobileMenu.label}</span>

          <ul className="mobile-nav__links">
            {navLinks.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="mobile-nav__link"
                  aria-current={link.href === current ? "page" : undefined}
                  onClick={close}
                >
                  <span className="mobile-nav__index mono" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mobile-nav__label">{link.label}</span>
                  <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
                </Link>
              </li>
            ))}
          </ul>

          <footer className="mobile-nav__footer">
            <p className="mono">{mobileMenu.platforms}</p>
            <a className="hint" href={`mailto:${appInfo.supportEmail}`}>
              <Mail className="icon icon--sm" strokeWidth={1.75} />
              <span>
                {mobileMenu.help} <span className="text-link">{appInfo.supportEmail}</span>
              </span>
            </a>
          </footer>
        </div>
      </nav>
    </div>
  );
}
