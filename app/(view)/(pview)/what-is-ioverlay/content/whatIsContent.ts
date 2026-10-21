// Static content for the "What is iOverlay?" page. Facts mirror iobserver-app (see its README).

import { routes } from "@/helper/route";

export const intro = {
  eyebrow: "Basics",
  title: "What is iOverlay?",
  lead: "iOverlay is a desktop app that puts a private window on top of your screen. You can read it while you present, but screen shares, recordings and screenshots leave it out.",
};

export const oneLine = {
  label: "In one line:",
  text: "It's a window on your screen that your audience never sees.",
};

export const factSheet = {
  rows: [
    { term: "What", value: "Desktop overlay app" },
    { term: "Runs on", value: "macOS (Apple Silicon and Intel) · Windows 10 and 11 · Linux coming soon" },
    { term: "Hidden from", value: "Zoom · Meet · Teams · Recordings · Screenshots" },
    { term: "Inside", value: "Built-in browser · AI chat (soon)" },
    { term: "Controls", value: "Opacity · Click-through · Global shortcuts" },
  ],
};

export const insideSection = {
  eyebrow: "Inside the overlay",
  title: "What you can do in it.",
  lead: "The overlay is a small panel you drag and resize anywhere. Here's what it holds.",
};

export const insideTopics = [
  {
    label: "Browse",
    title: "Embedded Chrome browser",
    description: "Open any site inside the overlay: your notes, docs, a script or a dashboard.",
    link: { href: routes.embeddedChromeBrowser, label: "About the browser" },
  },
  {
    label: "Coming soon",
    title: "Your AI model",
    description: "Chat with the AI model you prefer, right inside the private panel.",
  },
  {
    label: "Control",
    title: "Stays out of the way",
    description: "Fade it from 30 to 100% opacity, let clicks pass through, and drive it with shortcuts.",
  },
];

export const hidingSection = {
  eyebrow: "How it stays hidden",
  title: "Your screen, minus one window.",
  lead: "iOverlay doesn't fight the screen-share app. It asks your operating system to leave the overlay out of every capture.",
};

export const hidingSteps = [
  {
    title: "You open the overlay",
    description: "It floats above every app, including full-screen ones, on every desktop.",
  },
  {
    title: "The OS skips it",
    description: "macOS marks the overlay as excluded from screen capture.",
  },
  {
    title: "They see the rest",
    description: "Viewers get your full screen with the overlay missing. You still see it.",
  },
];

export const limits = {
  title: "Good to know",
  items: [
    "iOverlay runs on macOS and Windows. The Linux version is coming soon.",
    "On macOS 15 and later, some capture tools have been reported to record it anyway. Test with the tools you use.",
    "Nothing can hide it from a camera pointed at your screen.",
  ],
};

export const useCasesSection = {
  eyebrow: "Who it's for",
  title: "Made for people who present.",
  lead: "Anyone who shares a screen and wants their own material in view.",
};

export const useCases = [
  { label: "01 · Presenters", description: "Keep talking points next to your slides without a second monitor." },
  { label: "02 · Sales demos", description: "Keep pricing, objections and next steps in view while you demo." },
  { label: "03 · Teachers", description: "Follow your lesson plan while the class watches the shared screen." },
  { label: "04 · Support", description: "Keep runbooks and checklists open while you screen-share with a customer." },
  { label: "05 · Interviews", description: "Keep your prep notes in view as an interview helper during video interviews." },
  { label: "06 · Creators", description: "Read a script in the embedded Chrome browser while you record your screen." },
];

export const closing = {
  title: "Ready to try it?",
  lead: "Pay by UPI, upload the screenshot and your login arrives within 24 hours.",
  cta: { href: routes.getIOverlay, label: "Get iOverlay" },
};
