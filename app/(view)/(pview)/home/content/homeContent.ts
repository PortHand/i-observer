// Static content for the Home page, mirroring iobserver-app. Pricing and demo values are placeholders.

import {
  Eye,
  MousePointerClick,
  Power,
  Sparkles,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { homeSection, routes } from "@/helper/route";

export const appInfo = {
  name: "iObserver",
  version: "1.0.0",
  tagline: "Invisible to screen share",
  utility: "Private screen overlay",
};

// Pages only; the link matching the current page is marked active.
export const navLinks = [
  { href: routes.home, label: "Home" },
  { href: routes.whatIsIObserver, label: "What is iObserver?" },
  { href: routes.getIObserver, label: "Get iObserver" },
];

export const hero = {
  eyebrow: "Private screen overlay",
  titleStart: "You see it.",
  titleAccent: "They",
  titleEnd: "don't.",
  lead: "iObserver puts a private window on top of your screen for your notes, docs or any website. Share your screen in Zoom, Meet or Teams and that window stays out of the picture.",
  primaryCta: { href: routes.whatIsIObserver, label: "What is iObserver?" },
  demoCta: { href: homeSection("demo"), label: "Watch the demo" },
  fineprint: "Windows · macOS · Linux · Login within 24 hours",
};

export const heroExplainer = {
  label: "During a screen share",
  overlayTitle: "iObserver",
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
    title: "What is iObserver?",
    description: "A floating window only you can see, even while you share your screen.",
    link: { href: routes.whatIsIObserver, label: "Read the overview" },
  },
  {
    label: "Setup",
    title: "How do I get it?",
    description: "Pay by UPI, upload the screenshot and get your login within 24 hours.",
    link: { href: routes.getIObserver, label: "See the steps" },
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
  cta: { href: routes.getIObserver, label: "Get iObserver" },
};

export const demo = {
  eyebrow: "Demo",
  title: "See it in action.",
  lead: "A short walkthrough of the overlay, from sign-in to screen share.",
  /** YouTube video id (the part after `watch?v=` in its URL). */
  videoId: "aqz-KE-bpKQ",
  videoTitle: "iObserver demo",
};

export interface Plan {
  name: string;
  icon: LucideIcon;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const pricing = {
  eyebrow: "Pricing",
  title: "Simple plans.",
  lead: "Start free. Upgrade when you need more devices and saved notes.",
  badge: "Popular",
  signInRequired: "Sign in to choose a plan.",
};

export const plans: Plan[] = [
  {
    name: "Free",
    icon: Sparkles,
    price: "$0",
    period: "forever",
    description: "Try the overlay on a single device.",
    features: ["1 device", "Capture-protected overlay", "Global shortcuts"],
  },
  {
    name: "Pro",
    icon: Zap,
    price: "$12",
    period: "per month",
    description: "For people who present every day.",
    features: ["3 devices", "Everything in Free", "Saved notes", "Priority support"],
    highlighted: true,
  },
  {
    name: "Team",
    icon: Users,
    price: "$29",
    period: "per user / month",
    description: "Shared setup for whole teams.",
    features: ["Unlimited devices", "Everything in Pro", "Team management", "SSO"],
  },
];

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
