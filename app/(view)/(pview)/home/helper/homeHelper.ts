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

export const youtubeEmbedUrl = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`;
