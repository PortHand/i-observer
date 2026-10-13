"use client";

// Custom select, following the WAI-ARIA "select-only combobox" pattern: focus stays on the trigger,
// which points at the highlighted option with aria-activedescendant. Keyboard: arrows, Home/End,
// type-ahead, Enter/Space to choose, Escape to close. Styled like `.input`, and submits through a
// hidden input so FormData sees it. Styles live in app/globals.css under "Dropdown".

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  /** Optional second line under the label. */
  description?: string;
}

interface DropdownProps<T extends string> {
  options: DropdownOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  /** Form field name; the value is submitted through a hidden input. */
  name?: string;
  placeholder?: string;
  /** Leading icon, as in `.input-group`. */
  icon?: LucideIcon;
  /** Id of the visible label, since a button can't be labelled by a wrapping <label>. */
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
}

export default function Dropdown<T extends string>({
  options,
  value,
  onChange,
  name,
  placeholder = "Select…",
  icon: Icon,
  labelledBy,
  describedBy,
  invalid,
  disabled,
  id,
}: DropdownProps<T>) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ text: "", timer: undefined as ReturnType<typeof setTimeout> | undefined });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  // Close when clicking or tapping outside.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the active option visible while moving through a long list.
  useEffect(() => {
    if (open && activeIndex >= 0) {
      document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
    }
    // optionId only depends on baseId, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  useEffect(() => () => clearTimeout(typeahead.current.timer), []);

  const openList = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    close();
  };

  /** Jumps to the next option starting with the typed letters, like a native select. */
  const typeTo = (key: string) => {
    const state = typeahead.current;
    clearTimeout(state.timer);
    state.text += key.toLowerCase();
    state.timer = setTimeout(() => (state.text = ""), 500);
    const start = state.text.length === 1 ? activeIndex + 1 : activeIndex;
    for (let step = 0; step < options.length; step++) {
      const index = (start + step) % options.length;
      if (options[index].label.toLowerCase().startsWith(state.text)) return setActiveIndex(index);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const printable = event.key.length === 1 && event.key !== " " && !event.metaKey && !event.ctrlKey && !event.altKey;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList(event.key === "ArrowUp" && selectedIndex < 0 ? options.length - 1 : undefined);
      } else if (printable) {
        openList();
        typeTo(event.key);
      }
      return;
    }
    const last = options.length - 1;
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActiveIndex((index) => Math.min(index + 1, last)),
      ArrowUp: () => setActiveIndex((index) => Math.max(index - 1, 0)),
      Home: () => setActiveIndex(0),
      End: () => setActiveIndex(last),
      Enter: () => choose(activeIndex),
      " ": () => choose(activeIndex),
      Escape: close,
    };
    if (keys[event.key]) {
      event.preventDefault();
      keys[event.key]();
    } else if (event.key === "Tab") {
      close();
    } else if (printable) {
      typeTo(event.key);
    }
  };

  const classes = ["dropdown", open && "dropdown--open", Icon && "dropdown--icon"].filter(Boolean).join(" ");

  return (
    <div ref={rootRef} className={classes}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={triggerRef}
        id={baseId}
        type="button"
        role="combobox"
        className="input dropdown__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-labelledby={labelledBy ? `${labelledBy} ${baseId}` : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        onBlur={close}
      >
        {Icon && <Icon className="icon dropdown__icon" strokeWidth={1.75} aria-hidden="true" />}
        <span className={selected ? "dropdown__value" : "dropdown__value dropdown__value--placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="icon dropdown__chevron" strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open && (
        <ul id={listId} className="dropdown__list" role="listbox" aria-labelledby={labelledBy}>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const optionClasses = [
              "dropdown__option",
              index === activeIndex && "dropdown__option--active",
              isSelected && "dropdown__option--selected",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <li
                key={option.value}
                id={optionId(index)}
                className={optionClasses}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => setActiveIndex(index)}
                // Keep focus on the trigger, so its blur doesn't close the list before the click lands.
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
              >
                <span className="dropdown__option-text">
                  <span>{option.label}</span>
                  {option.description && <span className="dropdown__option-description">{option.description}</span>}
                </span>
                {isSelected && <Check className="icon icon--sm" strokeWidth={2} aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
