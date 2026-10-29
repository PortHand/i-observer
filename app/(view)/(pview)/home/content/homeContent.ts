// Static content for the Home page, mirroring iobserver-app. Demo values are placeholders; plans and
// prices come from the database (plans and plan_prices tables).

import {
  Crown,
  Eye,
  Gem,
  MousePointerClick,
  Power,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { apiRoutes, homeSection, routes } from "@/helper/route";

export const appInfo = {
  name: "iOverlay",
  version: "1.0.4",
  tagline: "Invisible to screen share",
  utility: "Private screen overlay",
  /** The one support mailbox, shown on the contact page and in checkout. */
  supportEmail: "support@i-overlay.com",
};

/** The phone and tablet menu (components/MobileNav.tsx). */
export const mobileMenu = {
  label: "Menu",
  open: "Open menu",
  close: "Close menu",
  platforms: "macOS and Windows · Linux coming soon",
  help: "Need help?",
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
  fineprint: "macOS and Windows · Linux coming soon · Login within 24 hours",
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
  /** The account menu in the header, for signed-in visitors. */
  menu: {
    signedInAs: "Signed in as",
    roles: { customer: "Customer", admin: "Admin" },
    download: "Download app",
    profile: "Profile",
    orders: "Orders & payments",
    admin: "Admin dashboard",
    signOut: "Sign out",
  },
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
    description: "Runs on macOS and Windows, hidden from screen capture on both. Linux is coming soon.",
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
  { value: "Mac · PC", label: "macOS and Windows" },
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
  /** The intro video, served from Supabase through this route. */
  videoSrc: apiRoutes.introVideo,
  /** Shown until the video plays (public/intro-banner.jpg, from brand/intro-video/banner.jpg). */
  videoPoster: "/intro-banner.jpg",
  videoTitle: "iOverlay demo",
  /** For video search (VideoObject structured data). Update when the video is replaced. */
  videoDescription:
    "A walkthrough of iOverlay, the invisible screen overlay: sign in, open the embedded browser and share your screen in Zoom, Meet or Teams while the overlay stays hidden.",
  videoUploaded: "2026-10-21",
};

/** Links in the site footer, so every page links to the search landing pages. */
export const footerLinks = [
  { href: routes.whatIsIOverlay, label: "What is iOverlay?" },
  { href: routes.interviewHelper, label: "Interview helper" },
  { href: routes.screenHider, label: "Screen hider" },
  { href: routes.invisibleOverlay, label: "Invisible overlay" },
  { href: routes.embeddedChromeBrowser, label: "Embedded Chrome browser" },
  { href: routes.getIOverlay, label: "Pricing" },
  { href: routes.contact, label: "Contact & FAQ" },
];

export const footer = { linksLabel: "Site" };

export const pricing = {
  eyebrow: "Pricing",
  title: "Simple plans.",
  lead: "Pay once by UPI, with no auto-renewal. Buy again before your time runs out and the new time is added on, so you never lose days.",
  /** Every plan is the full app; plans differ only in how long they last. */
  features: ["Capture-protected overlay", "Global shortcuts", "macOS and Windows", "Login by email within 24 hours"],
  /** Card icons, in plan order (repeating if there are more plans). Decorative only. */
  icons: [Zap, Sparkles, Gem, Crown] as LucideIcon[],
  choose: "Choose {plan}",
  /** Beside the struck-through original price. */
  off: "{percent}% off",
  /** Read out before the struck-through price, which screen readers don't mark. */
  was: "Was",
  loading: "Loading plans…",
  unavailable: "Plans can't be shown right now. Email {supportEmail} and we'll help you buy.",
  /** The admin's offer countdown: over the plans, and in the bar at the top of every page. */
  countdown: {
    eyebrow: "Limited-time offer",
    /** Unit labels under the banner's digits, and after the bar's. */
    units: { days: "Days", hours: "Hrs", minutes: "Min", seconds: "Sec" },
    short: { days: "d", hours: "h", minutes: "m", seconds: "s" },
    viewPlans: "View plans",
    /** Read out once, since the digits themselves aren't announced as they tick. */
    endsAt: "Ends {date}",
  },
};

export interface OsSupport {
  name: string;
  requirement: string;
  download: string;
  /** Whether the overlay is hidden from screen capture on this system. */
  captureHidden: boolean;
  /** Only where capture behaves differently; the tag covers the rest. */
  note?: string;
  /** Not released yet: shown as "Coming soon" instead of the capture tag. */
  comingSoon?: boolean;
}

export const osSection = {
  eyebrow: "Platforms",
  title: "Runs where you work.",
  lead: "iOverlay runs on macOS and Windows, hidden from screen capture on both. A Linux version is on the way.",
  hidden: "Hidden from capture",
  visible: "Visible in capture",
  comingSoon: "Coming soon",
};

// The released apps (macOS, Windows) lead the list; Linux is announced but not out yet.
export const osSupport: OsSupport[] = [
  {
    name: "macOS",
    requirement: "macOS 12 or later · Apple Silicon and Intel",
    download: ".dmg",
    captureHidden: true,
  },
  {
    name: "Windows",
    requirement: "Windows 10 or 11 · 64-bit",
    download: ".exe installer",
    captureHidden: true,
  },
  {
    name: "Linux",
    requirement: "64-bit · Ubuntu, Debian and most distros",
    download: ".AppImage",
    captureHidden: false,
    comingSoon: true,
    note: "In the works. Linux can't hide windows from screen capture, so the overlay will show in shares there.",
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
