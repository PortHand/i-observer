"use client";

// The role tabs and the selected role's full prompt with a copy button. Tabs follow the WAI-ARIA
// tabs pattern (arrow keys move between roles). The chosen role is remembered in localStorage so
// returning visitors land on it; every prompt is also in the HTML for search engines and no-JS.

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { Check, CircleAlert, Copy } from "lucide-react";
import { library, promptRoles, type RoleId } from "../content/promptsContent";

const STORAGE_KEY = "prompt-role";
const COPIED_MS = 2200;

type CopyState = "idle" | "copied" | "failed";

const subscribeNoop = () => () => {};

/** The role picked on an earlier visit, if any. */
const readSaved = (): RoleId | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return promptRoles.some((role) => role.id === saved) ? (saved as RoleId) : null;
  } catch {
    return null;
  }
};

export default function PromptLibrary() {
  // The server renders the first role; on load the browser switches to the one saved last visit.
  const saved = useSyncExternalStore(subscribeNoop, readSaved, () => null);
  const [picked, setPicked] = useState<RoleId | null>(null);
  const active = picked ?? saved ?? promptRoles[0].id;
  const [copy, setCopy] = useState<CopyState>("idle");
  const tabsRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  useEffect(() => {
    if (copy === "idle") return;
    const timer = window.setTimeout(() => setCopy("idle"), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copy]);

  const select = (id: RoleId) => {
    setPicked(id);
    setCopy("idle");
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Storage blocked: the choice lasts for this visit.
    }
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = promptRoles[(index + step + promptRoles.length) % promptRoles.length];
    select(next.id);
    tabsRef.current?.querySelector<HTMLButtonElement>(`[data-role="${next.id}"]`)?.focus();
  };

  const role = promptRoles.find((item) => item.id === active) ?? promptRoles[0];
  const words = role.prompt.trim().split(/\s+/).length;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(role.prompt);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  };

  return (
    <div className="prompt-library" data-reveal>
      <div ref={tabsRef} className="prompt-tabs" role="tablist" aria-label={library.tabsLabel}>
        {promptRoles.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${item.id}`}
            data-role={item.id}
            aria-selected={item.id === active}
            aria-controls={`${baseId}-panel-${item.id}`}
            tabIndex={item.id === active ? 0 : -1}
            className="prompt-tabs__tab"
            onClick={() => select(item.id)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {promptRoles.map((item) => (
        <section
          key={item.id}
          id={`${baseId}-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${item.id}`}
          className="prompt-card"
          hidden={item.id !== active}
        >
          <header className="prompt-card__head">
            <div className="prompt-card__title">
              <h3>{item.title}</h3>
              <p className="text-muted">{item.summary}</p>
            </div>
            <div className="prompt-card__actions">
              <span className="prompt-card__count mono">{library.words.replace("{count}", String(words))}</span>
              <button type="button" className="button button--primary" onClick={copyPrompt}>
                {copy === "copied" ? <Check className="icon icon--sm" strokeWidth={2} /> : <Copy className="icon icon--sm" strokeWidth={1.75} />}
                {copy === "copied" ? library.copied : library.copy}
              </button>
            </div>
          </header>
          {copy === "failed" && item.id === active && (
            <p className="form-error prompt-card__error" role="alert">
              <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
              {library.copyFailed}
            </p>
          )}
          <pre className="prompt-card__text" tabIndex={0}>
            {item.prompt}
          </pre>
        </section>
      ))}

      <p className="visually-hidden" role="status" aria-live="polite">
        {copy === "copied" ? `${role.label} prompt copied` : ""}
      </p>
    </div>
  );
}
