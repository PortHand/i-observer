// Static content for the welcome (download) page.

import { Download, KeyRound, MonitorUp, Rocket } from "lucide-react";
import { apiRoutes } from "@/helper/route";

export const welcome = {
  eyebrow: "Signed in",
  title: "Welcome to iOverlay",
  lead: "Pick your computer, follow the steps to get past its one-time security check, then download below. Sign in to the app with the same login and you're ready for your next screen share.",
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
  { id: "windows", os: "Windows", label: "Windows", detail: "Windows 10 or 11 · 64-bit · .exe" },
  { id: "linux", os: "Linux", label: "Linux", detail: "64-bit · .AppImage", comingSoon: true },
];

export const download = {
  label: "Download",
  title: "iOverlay for {installer}",
  lead: "Download it, then follow the steps above.",
  preparing: "Preparing your secure download link…",
  started: "Your download has started.",
  startedHint: "Didn't start? Click download again: each click makes a new private link that works for one minute.",
  downloadNow: "Download now",
  downloadAgain: "Download again",
  unknownDevice: "We couldn't tell which computer you're on. iOverlay runs on macOS and Windows: pick yours.",
  comingSoonTitle: "{os} is coming soon",
  comingSoonText: "iOverlay is on macOS and Windows today. The {os} app is in the works, and your plan covers it when it's out. On a Mac or a Windows PC? Pick it above.",
  comingSoon: "Coming soon",
  /** The two Mac installers, by chip. */
  macArchLabel: "Your Mac's chip",
  macArch: [
    { id: "mac-arm64", label: "Apple Silicon", detail: "M1 and later" },
    { id: "mac-x64", label: "Intel", detail: "Intel Macs" },
  ] satisfies { id: InstallerId; label: string; detail: string }[],
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
    { icon: Download, label: "Install", description: "Mac: open the .dmg and drag iOverlay to Applications. Windows: run the setup .exe." },
    { icon: KeyRound, label: "Sign in", description: "Start iOverlay and sign in with the email and password from your login email." },
    { icon: Rocket, label: "Open the overlay", description: "Press Start overlay, then load your notes, a doc or any website inside it." },
    { icon: MonitorUp, label: "Share your screen", description: "Share in Zoom, Meet or Teams as usual. You see the overlay; they don't." },
  ],
  firstRun: {
    title: "First launch tips",
    items: [
      "The first time you open iOverlay, macOS or Windows asks you to confirm it: follow the steps for your computer at the top of this page, once.",
      "The first time you share your screen, macOS asks for Screen Recording permission: allow it in System Settings → Privacy & Security.",
      "On Windows, voice input needs the microphone: if it stays silent, turn on Settings → Privacy & security → Microphone → Let desktop apps access your microphone.",
    ],
  },
};

/** The illustration drawn for each macOS step (components/MacOpenShot.tsx). */
export type MacOpenShot = "install" | "blocked" | "settings" | "confirm";

/** The illustration drawn for each Windows step (components/WindowsOpenShot.tsx). */
export type WindowsOpenShot = "run" | "protected" | "run-anyway" | "install";

/** What to do when a step goes differently: a short text, then a command to paste or a list. */
export interface FirstOpenFix {
  title: string;
  text: string;
  command?: string;
  items?: string[];
}

/**
 * The setup guide at the top of the page (components/SetupGuide.tsx): one tab per system, opened on
 * the visitor's own, with its install steps and the download below them. Neither installer is
 * signed yet (no Apple notarization, no Windows code-signing certificate), so both systems ask the
 * user to confirm the first time.
 */
export const setupGuide = {
  tabsLabel: "Your computer",
  stepLabel: "Step {n}",
  copy: "Copy",
  copied: "Copied",
  linux: { tab: "Linux", tabDetail: "Coming soon" },
};

/**
 * Getting past Gatekeeper the first time. The app isn't notarized by Apple, so macOS blocks the
 * first launch; macOS 15 and later dropped right-click → Open, leaving Open Anyway in Settings.
 */
export const macOpen = {
  /** The tab's anchor: links to "#open-on-mac" open this tab. */
  id: "open-on-mac",
  tab: "macOS",
  tabDetail: "Apple Silicon and Intel",
  hint: "macOS warns the first time you open it: steps 2 to 4 above get you past it, once.",
  steps: [
    {
      shot: "install",
      title: "Install it",
      text: "Open the downloaded .dmg and drag iOverlay onto the Applications folder.",
    },
    {
      shot: "blocked",
      title: "Open it, then click Done",
      text: "Double-click iOverlay in Applications. macOS says it couldn't verify the app: click Done. Don't click Move to Bin.",
    },
    {
      shot: "settings",
      title: "Click Open Anyway",
      text: "Open System Settings → Privacy & Security, scroll down to Security and click Open Anyway next to \"iOverlay\" was blocked.",
    },
    {
      shot: "confirm",
      title: "Confirm",
      text: "Click Open Anyway again and enter your Mac password. iOverlay opens, and from now on it opens like any other app.",
    },
  ] satisfies { shot: MacOpenShot; title: string; text: string }[],
  fix: {
    title: "macOS says \"iOverlay is damaged\"?",
    text: "Open Terminal (Applications → Utilities), paste this line, press Return, then open iOverlay again:",
    command: "xattr -dr com.apple.quarantine /Applications/iOverlay.app",
  } satisfies FirstOpenFix,
};

/**
 * Getting past SmartScreen the first time. The installer isn't code-signed yet, so Windows warns
 * before running it and names an "Unknown publisher". The installer is electron-builder's assisted
 * NSIS one (iobserver-app/electron-builder.yml): install mode, folder, then Finish with Run ticked.
 */
export const windowsOpen = {
  /** The tab's anchor: links to "#open-on-windows" open this tab. */
  id: "open-on-windows",
  tab: "Windows",
  tabDetail: "Windows 10 and 11 · 64-bit",
  hint: "Windows may say it protected your PC: click More info, then Run anyway (steps 2 and 3 above).",
  steps: [
    {
      shot: "run",
      title: "Run the installer",
      text: "Open your Downloads folder (or your browser's downloads) and double-click the iOverlay setup file, overlay-…-setup.exe.",
    },
    {
      shot: "protected",
      title: "Click More info",
      text: "Windows says \"Windows protected your PC\". Click More info under the message. Don't click Don't run.",
    },
    {
      shot: "run-anyway",
      title: "Click Run anyway",
      text: "The publisher shows as Unknown publisher because the app isn't signed yet. Check the app is overlay-…-setup.exe, then click Run anyway.",
    },
    {
      shot: "install",
      title: "Install and open",
      text: "Choose Only for me, keep the suggested folder and click Install. If Windows asks to allow changes, click Yes. Leave Run iOverlay ticked and click Finish.",
    },
  ] satisfies { shot: WindowsOpenShot; title: string; text: string }[],
  fix: {
    title: "Your browser blocked the download?",
    text: "Browsers hold back new apps they haven't seen often. Keep the file, then run it as in step 1:",
    items: [
      "Chrome: open Downloads (Ctrl+J) and click Keep next to the file.",
      "Edge: open Downloads (Ctrl+J), click … next to the file, then Keep → Show more → Keep anyway.",
      "Antivirus moved it to quarantine? Restore it there, or download it again from this page.",
    ],
  } satisfies FirstOpenFix,
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
