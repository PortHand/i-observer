"use client";

// The header's two-way theme switch: night (dark) or day (light). The choice is the `data-theme`
// attribute on <html>, saved in localStorage; themeScript (./themeScript.ts) applies it before the
// first paint, so the page never flashes the other theme. Where the browser supports view
// transitions, the switch cross-fades. Styles in app/globals.css under "Theme switch".

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY, type Theme } from "./themeScript";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};

const readTheme = (): Theme => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
];

export default function ThemeToggle() {
  // The server can't know the visitor's theme; it renders dark and the switch corrects itself on load.
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "dark");

  const choose = (next: Theme) => {
    if (next === theme) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked (private mode): the choice lasts for this page only.
    }
    const apply = () => document.documentElement.setAttribute("data-theme", next);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduced) document.startViewTransition(apply);
    else apply();
  };

  return (
    <div className={`theme-toggle theme-toggle--${theme}`} role="group" aria-label="Theme">
      <span className="theme-toggle__thumb" aria-hidden="true" />
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className="theme-toggle__option"
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
          onClick={() => choose(value)}
        >
          <Icon className="icon icon--sm" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}
