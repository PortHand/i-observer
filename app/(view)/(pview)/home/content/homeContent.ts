// Static content for the Home page, mirroring iobserver-app. Demo values are placeholders; plans and
// prices come from the database (plans and plan_prices tables).

import {
  Eye,
  Gem,
  MousePointerClick,
  Power,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { homeSection, routes } from "@/helper/route";

export const appInfo = {
  name: "iOverlay",
  version: "1.0.0",
  tagline: "Invisible to screen share",
  utility: "Private screen overlay",
  /** The one support mailbox, shown on the contact page and in checkout. */
  supportEmail: "support@i-overlay.com",
};

// Pages only; the link matching the current page is marked active.
export const navLinks = [
  { href: routes.home, label: "Home" },
  { href: routes.whatIsIOverlay, label: "What is iOverlay?" },
  { href: routes.getIOverlay, label: "Get iOverlay" },
  { href: routes.contact, label: "Contact" },
];

export const hero = {
  eyebrow: "Private screen overlay",
  titleStart: "You see it.",
  titleAccent: "They",
  titleEnd: "don't.",
  lead: "iOverlay puts a private window on top of your screen for your notes, docs or any website. Share your screen in Zoom, Meet or Teams and that window stays out of the picture.",
  primaryCta: { href: routes.whatIsIOverlay, label: "What is iOverlay?" },
  demoCta: { href: homeSection("demo"), label: "Watch the demo" },
  fineprint: "Windows · macOS · Linux · Login within 24 hours",
};

export const heroExplainer = {
  label: "During a screen share",
  overlayTitle: "iOverlay",
  notes: ["Open with the Q3 numbers", "Revenue up 18% YoY", "Ask about the rollout date"],
  yours: "On your screen",
  theirs: "What they see",
  hidden: "Hidden from capture",
  caption: "Same screen, two views.",
};

export const auth = {
  signIn: {
    label: "Account",
    title: "Sign in",
    description: "Sign in to start your private overlay.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Your password",
    submit: "Sign in",
  },
  signedIn: {
    label: "Ready",
    title: "Start your overlay",
    profileLabel: "Signed in as",
    startOverlay: "Start overlay",
    toggleHint: "Toggle any time with",
    signOut: "Sign out",
  },
  navSignedOut: "Sign in",
  navSignedIn: "Account",
};

export const questionsSection = {
  title: "Start with the question.",
  lead: "The three things people ask first, with where to find the answer.",
};

export const questions = [
  {
    label: "Basics",
    title: "What is iOverlay?",
    description: "A floating window only you can see, even while you share your screen.",
    link: { href: routes.whatIsIOverlay, label: "Read the overview" },
  },
  {
    label: "Setup",
    title: "How do I get it?",
    description: "Pay by UPI, upload the screenshot and get your login within 24 hours.",
    link: { href: routes.getIOverlay, label: "See the steps" },
  },
  {
    label: "Platforms",
    title: "Will it work on my computer?",
    description: "Windows and macOS hide it from capture. Linux runs it but can't hide it.",
    link: { href: homeSection("platforms"), label: "Check your system" },
  },
];

export const howSection = {
  title: "How it works in a meeting.",
  lead: "Four steps, from opening the overlay to presenting with it.",
};

export const howSteps = [
  { label: "Open", description: "Start the overlay from the app. It floats above every window." },
  { label: "Fill", description: "Open your notes, a doc or any website inside it." },
  { label: "Share", description: "Share your screen in Zoom, Meet or Teams as usual." },
  { label: "Present", description: "You read the overlay. Viewers only see what's under it." },
];

export const stats = [
  { value: "3", label: "Desktop systems" },
  { value: "30–100%", label: "Overlay opacity" },
  { value: "3", label: "Global shortcuts" },
  { value: "24 h", label: "Login delivery" },
];

export const closing = {
  title: "Ready to present privately?",
  lead: "Pay by UPI, upload the screenshot and your login arrives within 24 hours.",
  cta: { href: routes.getIOverlay, label: "Get iOverlay" },
};

export const demo = {
  eyebrow: "Demo",
  title: "See it in action.",
  lead: "A short walkthrough of the overlay, from sign-in to screen share.",
  /** YouTube video id (the part after `watch?v=` in its URL). */
  videoId: "aqz-KE-bpKQ",
  videoTitle: "iOverlay demo",
};

export const pricing = {
  eyebrow: "Pricing",
  title: "Simple plans.",
  lead: "Pay once by UPI, with no auto-renewal. Buy again before your time runs out and the new time is added on, so you never lose days.",
  /** Every plan is the full app; plans differ only in how long they last. */
  features: ["Capture-protected overlay", "Global shortcuts", "Windows, macOS and Linux", "Login by email within 24 hours"],
  /** Card icons, in plan order (repeating if there are more plans). Decorative only. */
  icons: [Zap, Sparkles, Gem] as LucideIcon[],
  choose: "Choose {plan}",
  loading: "Loading plans…",
  unavailable: "Plans can't be shown right now. Email {supportEmail} and we'll help you buy.",
};

export interface OsSupport {
  name: string;
  requirement: string;
  download: string;
  /** Whether the overlay is hidden from screen capture on this system. */
  captureHidden: boolean;
  /** Only where capture behaves differently; the tag covers the rest. */
  note?: string;
}

export const osSection = {
  eyebrow: "Platforms",
  title: "Works on your system.",
  lead: "Native apps for Windows, macOS and Linux. Check what each system supports before you buy.",
  hidden: "Hidden from capture",
  visible: "Visible in capture",
};

// Electron's content protection, which hides the overlay from capture, only works on Windows and macOS.
export const osSupport: OsSupport[] = [
  {
    name: "Windows",
    requirement: "Windows 10 or 11 · 64-bit",
    download: ".exe installer",
    captureHidden: true,
  },
  {
    name: "macOS",
    requirement: "macOS 12 or later · Apple Silicon and Intel",
    download: ".dmg",
    captureHidden: true,
  },
  {
    name: "Linux",
    requirement: "64-bit · Ubuntu, Debian and most distros",
    download: ".AppImage or .deb",
    captureHidden: false,
    note: "The overlay and shortcuts work, but Linux can't hide windows from screen capture.",
  },
];

export const shortcutsSection = {
  eyebrow: "Shortcuts",
  title: "Control it from anywhere.",
  lead: "These keyboard shortcuts work while any app has focus.",
};

export type ShortcutAction = "ToggleVisibility" | "ToggleClickThrough" | "Quit";

export const shortcutRows: { action: ShortcutAction; label: string; icon: LucideIcon }[] = [
  { action: "ToggleVisibility", label: "Show / hide overlay", icon: Eye },
  { action: "ToggleClickThrough", label: "Toggle click-through", icon: MousePointerClick },
  { action: "Quit", label: "Quit", icon: Power },
];
