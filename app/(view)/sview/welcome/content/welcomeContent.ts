// Static content for the welcome (download) page.

import { Download, KeyRound, MonitorUp, Rocket } from "lucide-react";
import { apiRoutes } from "@/helper/route";

export const welcome = {
  eyebrow: "Signed in",
  title: "Welcome to iOverlay",
  lead: "Download the installer for your computer, install the app, sign in with the same login, and you're ready for your next screen share.",
};

/** One installer per system. The file names match electron-builder's (iobserver-app/electron-builder.yml). */
export type InstallerId = "windows" | "mac-arm64" | "mac-x64" | "linux";

export interface Installer {
  id: InstallerId;
  os: string;
  label: string;
  detail: string;
  /** Not released yet: listed, but no download. */
  comingSoon?: boolean;
}

export const installers: Installer[] = [
  { id: "mac-arm64", os: "macOS", label: "macOS · Apple Silicon", detail: "M1 and later · .dmg" },
  { id: "mac-x64", os: "macOS", label: "macOS · Intel", detail: "Intel Macs · .dmg" },
  { id: "windows", os: "Windows", label: "Windows", detail: "Windows 10 or 11 · 64-bit", comingSoon: true },
  { id: "linux", os: "Linux", label: "Linux", detail: "64-bit · .AppImage", comingSoon: true },
];

export const download = {
  label: "Download",
  title: "Your installer",
  detected: "Detected: {installer}",
  preparing: "Preparing your secure download link…",
  started: "Your download has started.",
  startedHint: "Didn't start? Click download again: each click makes a new private link that works for one minute.",
  downloadNow: "Download {installer}",
  downloadAgain: "Download again",
  pickTitle: "All installers",
  pickHint: "Pick an installer. Each one gets its own short-lived link.",
  unknownDevice: "We couldn't tell which computer you're on. iOverlay runs on macOS: pick your Mac below.",
  comingSoonTitle: "{os} is coming soon",
  comingSoonText: "iOverlay is on macOS today. The {os} app is in the works, and your plan covers it when it's out. On a Mac? Pick your installer.",
  comingSoon: "Coming soon",
  macArchHint: "Not sure which Mac you have? Apple menu → About This Mac: \"Chip Apple M…\" is Apple Silicon, \"Processor Intel…\" is Intel.",
  lockedTitle: "Download unlocks with your plan",
  locked: {
    waiting: "We're checking your payment. The download unlocks as soon as it's approved, usually within 24 hours.",
    none: "You don't have an active plan yet. Choose a plan to unlock the download.",
    expired: "Your plan ended on {date}. Renew to download the latest version again.",
  },
  lockedCta: { orders: "See your orders", buy: "Get iOverlay" },
  error: "We couldn't make a download link. Please try again in a minute.",
  retry: "Try again",
};

export const howTo = {
  eyebrow: "How to use",
  title: "From download to presenting.",
  lead: "Four steps, about two minutes. Your login is the one we emailed you; you can find it in your inbox.",
  steps: [
    { icon: Download, label: "Install", description: "Open the .dmg and drag iOverlay to Applications." },
    { icon: KeyRound, label: "Sign in", description: "Start iOverlay and sign in with the email and password from your login email." },
    { icon: Rocket, label: "Open the overlay", description: "Press Start overlay, then load your notes, a doc or any website inside it." },
    { icon: MonitorUp, label: "Share your screen", description: "Share in Zoom, Meet or Teams as usual. You see the overlay; they don't." },
  ],
  firstRun: {
    title: "First launch tips",
    items: [
      "macOS may say the app is from an unidentified developer: right-click iOverlay in Applications and choose Open.",
      "The first time you share your screen, macOS asks for Screen Recording permission: allow it in System Settings → Privacy & Security.",
    ],
  },
};

export const video = {
  eyebrow: "Video guide",
  title: "Watch the walkthrough.",
  lead: "A short video covering install, sign-in, the shortcuts and a real screen share.",
  /** The intro video, served from Supabase through this route. */
  videoSrc: apiRoutes.introVideo,
  videoTitle: "iOverlay setup walkthrough",
};

export const help = {
  title: "Need a hand?",
  lead: "See your plan, orders and payments on your profile, or send us a message.",
  profile: "Open profile",
  contact: "Contact support",
};
