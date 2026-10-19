import { installers, type InstallerId } from "../content/welcomeContent";

export const isInstallerId = (value: unknown): value is InstallerId =>
  typeof value === "string" && installers.some((installer) => installer.id === value);

export const getInstaller = (id: InstallerId) => installers.find((installer) => installer.id === id)!;

/** Released installers only; Windows and Linux are listed as coming soon. */
export const isAvailableInstaller = (id: InstallerId) => !getInstaller(id).comingSoon;

/** The file electron-builder makes for this installer and app version, e.g. "overlay-1.0.0-setup.exe". */
export const installerFileName = (id: InstallerId, version: string) => {
  switch (id) {
    case "windows":
      return `overlay-${version}-setup.exe`;
    case "mac-arm64":
      return `overlay-${version}-arm64.dmg`;
    case "mac-x64":
      return `overlay-${version}-x64.dmg`;
    case "linux":
      return `overlay-${version}.AppImage`;
  }
};

type UserAgentData = { platform?: string; getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }> };

/**
 * The visitor's installer, or null on phones and anything else we can't place. Macs default to
 * Apple Silicon: only Chromium browsers say which chip they run on, and Safari doesn't.
 */
export const detectInstaller = async (): Promise<InstallerId | null> => {
  const agent = navigator.userAgent;
  if (/android|iphone|ipad|ipod/i.test(agent)) return null;
  if (/windows/i.test(agent)) return "windows";
  if (/mac/i.test(agent)) {
    const data = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
    try {
      const { architecture } = (await data?.getHighEntropyValues?.(["architecture"])) ?? {};
      if (architecture === "x86") return "mac-x64";
    } catch {
      // Hints refused: keep the default.
    }
    return "mac-arm64";
  }
  if (/linux|x11/i.test(agent)) return "linux";
  return null;
};

/** Fills "{name}" placeholders in a content string. */
export const fill = (text: string, values: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);

