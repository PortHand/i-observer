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

export const navLinks = [
  { href: routes.whatIsIObserver, label: "What is it?" },
  { href: homeSection("features"), label: "Features" },
  { href: homeSection("platforms"), label: "Platforms" },
  { href: homeSection("demo"), label: "Demo" },
  { href: homeSection("pricing"), label: "Pricing" },
  { href: homeSection("shortcuts"), label: "Shortcuts" },
  { href: routes.getIObserver, label: "Get iObserver" },
];

export const hero = {
  eyebrow: "Private by design",
  titleStart: "Your notes on screen.",
  titleAccent: "Invisible",
  titleEnd: "to everyone else.",
  lead: "A floating overlay that stays on top of every app while you present. Screen shares, recordings and screenshots never see it.",
  demoCta: "Watch the demo",
  pricingCta: "See pricing",
};

export const heroExplainer = {
  label: "How it works",
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

export interface Feature {
  label: string;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    label: "Browse",
    title: "Built-in browser",
    description: "Open your notes, docs or any site right inside the overlay.",
  },
  {
    label: "Position",
    title: "Always on top",
    description: "Floats above every app, including full-screen ones.",
  },
  {
    label: "Control",
    title: "Fully adjustable",
    description: "Opacity slider, click-through mode and global shortcuts.",
  },
];

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
