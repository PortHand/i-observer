import type { ShortcutAction } from "../content/homeContent";

export type Platform = "darwin" | "other";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());

/** Detects macOS in the browser; everything else uses Windows/Linux key names. */
export const detectPlatform = (): Platform =>
  /mac/i.test(navigator.userAgent) ? "darwin" : "other";

/** Global keyboard shortcuts (Electron accelerator syntax), same as the desktop app. */
export const getShortcuts = (platform: Platform): Record<ShortcutAction, string> => ({
  ToggleVisibility: platform === "darwin" ? "Alt+Shift+G" : "CommandOrControl+Shift+Space",
  ToggleClickThrough: "CommandOrControl+Shift+X",
  Quit: "CommandOrControl+Shift+Q",
});

/** Splits an accelerator into display keys, e.g. `Alt+Shift+G` → ⌥ ⇧ G on macOS. */
export const formatKeys = (accelerator: string, platform: Platform): string[] => {
  const isMac = platform === "darwin";
  return accelerator.split("+").map((key) => {
    if (key === "CommandOrControl") return isMac ? "⌘" : "Ctrl";
    if (key === "Alt") return isMac ? "⌥" : "Alt";
    if (key === "Shift") return isMac ? "⇧" : "Shift";
    return key;
  });
};

const HOUR_MS = 60 * 60 * 1000;

/**
 * When the offer countdown next reaches zero, in ms: `endsAt` while that's ahead; after it, the end
 * of the restart cycle `now` falls in when it restarts every `restartHours`, or null when it doesn't.
 */
export const offerDeadline = (endsAt: number, restartHours: number | null, now: number): number | null => {
  if (endsAt > now) return endsAt;
  if (!restartHours || restartHours <= 0) return null;
  const cycle = restartHours * HOUR_MS;
  return endsAt + (Math.floor((now - endsAt) / cycle) + 1) * cycle;
};

/** Whole days, hours, minutes and seconds left of `ms`. */
export const splitCountdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

/** "31 Oct, 9:00 pm IST": when the offer ends, for screen readers. Customers are in India. */
export const formatOfferEnd = (ms: number) =>
  `${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(ms)} IST`;
