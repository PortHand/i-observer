"use client";

// Date and time picker for datetime-local style values ("2026-10-20T09:30"), which callers read in
// one time zone (IST by default). A button styled like `.input` opens a panel: a calendar
// (react-day-picker, which handles its keyboard and screen reader support) beside hour, minute and
// AM/PM columns, with quick picks such as "+1 week". Escape closes it. Styles live in
// app/globals.css under "Date and time picker".

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface Parts {
  year: number;
  /** 0–11. */
  month: number;
  day: number;
  /** 0–23. */
  hour: number;
  minute: number;
}

interface DateTimePickerProps {
  /** "2026-10-20T09:30", or "" for none. */
  value: string;
  onChange: (value: string) => void;
  id?: string;
  /** Id of the visible label, since a button can't be labelled by a wrapping <label>. */
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Offers a Clear button, for fields that may be left empty. */
  clearable?: boolean;
  /** The time zone's name, shown after the chosen time, e.g. "IST". */
  zoneLabel?: string;
  /** The zone values are read in, for "today", the quick picks and the default time. IST unless set. */
  utcOffsetMinutes?: number;
}

const text = {
  dialog: "Choose a date and time",
  time: "Time",
  hour: "Hour",
  minute: "Minute",
  meridiem: "AM or PM",
  quick: "Quick pick",
  noneChosen: "No date chosen",
  clear: "Clear",
  done: "Done",
};

/** Quick picks: this long from now, at the same minute. */
const QUICK_PICKS = [
  { label: "+1 day", days: 1 },
  { label: "+3 days", days: 3 },
  { label: "+1 week", days: 7 },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
/** Minutes offered every 5; a saved value off that step is offered too. */
const MINUTE_STEP = 5;

const pad = (value: number) => String(value).padStart(2, "0");

const parseValue = (value: string): Parts | null => {
  const match = VALUE_PATTERN.exec(value);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  return { year, month: month - 1, day, hour, minute };
};

const toValue = ({ year, month, day, hour, minute }: Parts) => `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;

/** Now as wall-clock parts in the zone `offsetMinutes` from UTC. */
const nowIn = (offsetMinutes: number, plusMs = 0): Parts => {
  const date = new Date(Date.now() + plusMs + offsetMinutes * 60 * 1000);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate(), hour: date.getUTCHours(), minute: date.getUTCMinutes() };
};

/**
 * The calendar works on the browser's local dates; only the wall-clock day matters to it, so parts
 * become a local date at midnight and back, whatever the browser's own zone is.
 */
const toCalendarDate = ({ year, month, day }: Pick<Parts, "year" | "month" | "day">) => new Date(year, month, day);

/** "28 Oct 2026, 9:30 pm": the parts shown as written, without shifting zones. */
const shown = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });
const formatParts = (parts: Parts) => shown.format(Date.UTC(parts.year, parts.month, parts.day, parts.hour, parts.minute));

const hours12 = Array.from({ length: 12 }, (_, index) => index + 1);

const to24 = (hour12: number, pm: boolean) => (hour12 % 12) + (pm ? 12 : 0);

export default function DateTimePicker({
  value,
  onChange,
  id,
  labelledBy,
  describedBy,
  invalid,
  disabled,
  placeholder = "Pick a date and time",
  clearable,
  zoneLabel,
  utcOffsetMinutes = 330,
}: DateTimePickerProps) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const dialogId = `${baseId}-dialog`;
  const selected = parseValue(value);

  const [open, setOpen] = useState(false);
  /** Now in the values' time zone, read when the panel opens. */
  const [now, setNow] = useState<Parts | null>(null);
  /** The month the calendar shows. */
  const [month, setMonth] = useState(() => new Date(2000, 0, 1));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // Close when clicking or tapping outside.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Scroll each time column to its chosen entry, without moving the page.
  useEffect(() => {
    if (!open) return;
    timeRef.current?.querySelectorAll<HTMLElement>(".date-picker__column").forEach((column) => {
      const chosen = column.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (chosen) column.scrollTop = chosen.offsetTop - column.clientHeight / 2 + chosen.clientHeight / 2;
    });
  }, [open, value]);

  const show = () => {
    const current = nowIn(utcOffsetMinutes);
    setNow(current);
    setMonth(toCalendarDate(selected ?? current));
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  /** The time used until one is chosen: the next full hour. */
  const baseTime = () => selected ?? { hour: ((now?.hour ?? 0) + 1) % 24, minute: 0 };

  const pickDay = (date: Date) => {
    const { hour, minute } = baseTime();
    onChange(toValue({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), hour, minute }));
  };

  /** Sets the time on the chosen day, or today when none is chosen yet. */
  const setTime = (hour: number, minute: number) => {
    const day = selected ?? now ?? nowIn(utcOffsetMinutes);
    onChange(toValue({ year: day.year, month: day.month, day: day.day, hour, minute }));
  };

  const quickPick = (days: number) => {
    const parts = nowIn(utcOffsetMinutes, days * DAY_MS);
    // Rounded down to the minute step, so it's one the columns offer.
    const picked = { ...parts, minute: parts.minute - (parts.minute % MINUTE_STEP) };
    onChange(toValue(picked));
    setMonth(toCalendarDate(picked));
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    close();
  };

  const hour12 = selected ? selected.hour % 12 || 12 : null;
  const pm = baseTime().hour >= 12;
  const minutes = Array.from({ length: 60 / MINUTE_STEP }, (_, index) => index * MINUTE_STEP);
  if (selected && !minutes.includes(selected.minute)) minutes.push(selected.minute);
  minutes.sort((a, b) => a - b);

  const option = (label: string, pressed: boolean, onClick: () => void) => (
    <button key={label} type="button" className="date-picker__option" aria-pressed={pressed} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <div ref={rootRef} className={`dropdown date-picker${open ? " dropdown--open" : ""}`}>
      <button
        ref={triggerRef}
        id={baseId}
        type="button"
        // A plain button can't carry aria-invalid: the error is read out through describedBy.
        className={`input dropdown__trigger${invalid ? " date-picker__trigger--invalid" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-labelledby={labelledBy ? `${labelledBy} ${baseId}` : undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? close() : show())}
      >
        <CalendarDays className="icon dropdown__icon" strokeWidth={1.75} aria-hidden="true" />
        <span className={selected ? "dropdown__value" : "dropdown__value dropdown__value--placeholder"}>
          {selected ? `${formatParts(selected)}${zoneLabel ? ` ${zoneLabel}` : ""}` : placeholder}
        </span>
      </button>

      {open && (
        // Focusable, so a click on its empty space keeps focus inside instead of closing it.
        <div id={dialogId} className="date-picker__panel" role="dialog" aria-label={text.dialog} tabIndex={-1} onKeyDown={onPanelKeyDown}>
          <div className="date-picker__body">
            <DayPicker
              mode="single"
              required
              selected={selected ? toCalendarDate(selected) : undefined}
              onSelect={pickDay}
              month={month}
              onMonthChange={setMonth}
              today={now ? toCalendarDate(now) : undefined}
              weekStartsOn={0}
              showOutsideDays
              fixedWeeks
              navLayout="after"
              autoFocus
              classNames={{
                root: "date-picker__calendar",
                months: "date-picker__months",
                month: "date-picker__month",
                month_caption: "date-picker__caption",
                caption_label: "date-picker__caption-label",
                nav: "date-picker__nav",
                button_previous: "date-picker__nav-button",
                button_next: "date-picker__nav-button",
                month_grid: "date-picker__grid",
                weekdays: "date-picker__weekdays",
                weekday: "date-picker__weekday",
                week: "date-picker__week",
                day: "date-picker__day",
                day_button: "date-picker__day-button",
                selected: "date-picker__day--selected",
                today: "date-picker__day--today",
                outside: "date-picker__day--outside",
                focused: "date-picker__day--focused",
              }}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft className="icon icon--sm" strokeWidth={1.75} />
                  ) : (
                    <ChevronRight className="icon icon--sm" strokeWidth={1.75} />
                  ),
              }}
            />

            <div ref={timeRef} className="date-picker__time">
              <p className="date-picker__time-label">
                {text.time}
                {zoneLabel && ` · ${zoneLabel}`}
              </p>
              <p className="date-picker__readout mono" aria-hidden="true">
                {selected ? `${pad(hour12 ?? 12)}:${pad(selected.minute)}` : "--:--"}
                <span>{selected ? (pm ? "PM" : "AM") : ""}</span>
              </p>
              <div className="date-picker__columns">
                <div className="date-picker__column" role="group" aria-label={text.hour}>
                  {hours12.map((hour) => option(String(hour), hour === hour12, () => setTime(to24(hour, pm), baseTime().minute)))}
                </div>
                <div className="date-picker__column" role="group" aria-label={text.minute}>
                  {minutes.map((minute) => option(pad(minute), selected?.minute === minute, () => setTime(baseTime().hour, minute)))}
                </div>
                <div className="date-picker__column date-picker__column--short" role="group" aria-label={text.meridiem}>
                  {[false, true].map((isPm) =>
                    option(isPm ? "PM" : "AM", selected !== null && pm === isPm, () => setTime(to24(baseTime().hour % 12 || 12, isPm), baseTime().minute)),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="date-picker__quick" role="group" aria-label={text.quick}>
            <span className="date-picker__time-label">{text.quick}</span>
            {QUICK_PICKS.map((pick) => (
              <button key={pick.days} type="button" className="date-picker__chip" onClick={() => quickPick(pick.days)}>
                {pick.label}
              </button>
            ))}
          </div>

          <div className="date-picker__footer">
            <p className="date-picker__summary">
              {selected ? `${formatParts(selected)}${zoneLabel ? ` ${zoneLabel}` : ""}` : text.noneChosen}
            </p>
            <div className="date-picker__actions">
              {clearable && value && (
                <button
                  type="button"
                  className="button button--secondary button--sm"
                  onClick={() => {
                    onChange("");
                    close();
                  }}
                >
                  {text.clear}
                </button>
              )}
              <button type="button" className="button button--primary button--sm" onClick={close}>
                {text.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
