// Static content for the search landing pages: one entry per page, each written around the words
// people search for (interview helper, screen hider, invisible overlay, embedded Chrome). Facts
// mirror the "What is iOverlay?" page; keep them in step. The _landing folder is private (the
// underscore keeps it out of the URLs); each page lives in its own folder and renders LandingView.

import { routes } from "@/helper/route";
import type { StepItem } from "../../home/components/StepList";
import type { Topic } from "../../home/components/TopicGrid";

export type LandingId = "interviewHelper" | "screenHider" | "invisibleOverlay" | "embeddedChromeBrowser";

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingPage {
  path: string;
  /** Breadcrumb and link name. */
  name: string;
  seo: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; title: string; lead: string };
  /** One line under the share image heading. */
  shareLead: string;
  callout: { label: string; text: string };
  features: { eyebrow: string; title: string; lead: string; topics: Topic[] };
  steps: { eyebrow: string; title: string; lead: string; items: StepItem[] };
  faq: { eyebrow: string; title: string; lead: string; items: LandingFaq[] };
}

/** Shown on every landing page, under the steps. */
export const limits = {
  title: "Good to know",
  items: [
    "Hidden from capture on macOS and Windows. Linux is coming soon and can't hide windows from capture.",
    "On macOS 15 and later, some capture tools have been reported to record it anyway. Test with the tools you use.",
    "Nothing can hide it from a camera pointed at your screen.",
  ],
};

export const related = {
  eyebrow: "Explore",
  title: "More ways to use it.",
  lead: "The same private overlay, for whatever you keep on screen.",
  more: "Read more",
};

export const closing = {
  title: "Ready to try it?",
  lead: "Pay by UPI, upload the screenshot and your login arrives within 24 hours.",
  cta: { href: routes.getIOverlay, label: "Get iOverlay" },
};

const howSteps: StepItem[] = [
  { label: "Open", description: "Start the overlay from the app. It floats above every window, full-screen ones included." },
  { label: "Fill", description: "Open your notes, a doc or any website in its embedded Chrome browser." },
  { label: "Share", description: "Share your screen in Zoom, Google Meet or Microsoft Teams as usual." },
  { label: "Read", description: "You see the overlay. Viewers, recordings and screenshots don't." },
];

export const landingPages: Record<LandingId, LandingPage> = {
  interviewHelper: {
    path: routes.interviewHelper,
    name: "Interview helper",
    seo: {
      title: "Interview Helper App: Private Notes Hidden from Screen Share",
      description:
        "iOverlay is an interview helper for video interviews: keep your notes, STAR stories and questions on screen in an invisible overlay that Zoom, Google Meet and Teams screen shares leave out.",
      keywords: [
        "interview helper",
        "interview helper app",
        "online interview helper",
        "AI interview helper",
        "video interview notes",
        "interview notes overlay",
        "hidden notes for Zoom interview",
        "interview cheat sheet on screen",
        "technical interview helper",
        "remote interview assistant",
      ],
    },
    hero: {
      eyebrow: "Interview helper",
      title: "Your notes, in view through the whole interview.",
      lead: "iOverlay is an interview helper that keeps your prep on screen in a private overlay. Share your screen in Zoom, Google Meet or Teams and the overlay stays out of the picture.",
    },
    shareLead: "Interview notes on your screen, hidden from screen share.",
    callout: {
      label: "In one line:",
      text: "A floating notes window for video interviews that only you can see, even while you share your screen.",
    },
    features: {
      eyebrow: "Why it helps",
      title: "Prep you can glance at.",
      lead: "No second monitor, no sticky notes around the webcam. Everything sits in one window right where you look.",
      topics: [
        {
          label: "Notes",
          title: "Your talking points",
          description: "Keep STAR stories, project numbers and the questions you want to ask in one place.",
        },
        {
          label: "Browser",
          title: "Docs and sites",
          description: "Open the job description, your resume or a reference page in the embedded Chrome browser.",
        },
        {
          label: "Private",
          title: "Out of the share",
          description: "Share your screen for a live task and the overlay is left out of what the interviewer sees.",
        },
      ],
    },
    steps: {
      eyebrow: "How it works",
      title: "Set up before you join.",
      lead: "Four steps, from opening the overlay to answering with it.",
      items: howSteps,
    },
    faq: {
      eyebrow: "FAQ",
      title: "Interview helper questions.",
      lead: "What people ask before using iOverlay in an interview.",
      items: [
        {
          question: "What is an interview helper app?",
          answer:
            "An app that keeps your preparation in view during a video interview. iOverlay does it with a private overlay window: you read your notes, and screen shares, recordings and screenshots leave the window out.",
        },
        {
          question: "Will the interviewer see my notes when I share my screen?",
          answer:
            "No. On macOS and Windows the overlay is excluded from screen capture, so Zoom, Google Meet and Microsoft Teams show your screen without it. On macOS 15 and later some capture tools have been reported to record it anyway, so test with the tool your interview uses.",
        },
        {
          question: "Does it work for technical and coding interviews?",
          answer:
            "Yes. Keep notes, a checklist or reference docs open in the overlay while you share an editor or a whiteboard. Click-through lets you type in the window underneath without moving the overlay.",
        },
        {
          question: "Is it allowed in my interview?",
          answer:
            "That depends on the company. Some allow notes, some don't. Check the rules you were given and use iOverlay within them.",
        },
      ],
    },
  },

  screenHider: {
    path: routes.screenHider,
    name: "Screen hider",
    seo: {
      title: "Screen Hider: Hide a Window from Screen Share and Recording",
      description:
        "iOverlay is a screen hider for macOS and Windows: one window stays on your screen while Zoom, Google Meet and Teams screen shares, screen recordings and screenshots leave it out.",
      keywords: [
        "screen hider",
        "screen hider app",
        "hide window from screen share",
        "hide app from screen share",
        "hide screen during screen share",
        "hide window from screen recording",
        "hide window from screenshot",
        "exclude window from screen capture",
        "private window screen share",
        "screen share privacy",
      ],
    },
    hero: {
      eyebrow: "Screen hider",
      title: "Share your screen. Hide one window.",
      lead: "iOverlay is a screen hider: a private window that stays on your screen but out of every screen share, screen recording and screenshot.",
    },
    shareLead: "One window on your screen, left out of every capture.",
    callout: {
      label: "In one line:",
      text: "Your full screen goes out to the meeting, minus the one window you want to keep to yourself.",
    },
    features: {
      eyebrow: "What it hides from",
      title: "Left out of every capture.",
      lead: "iOverlay asks the operating system to skip the overlay, so it's hidden from every app that captures your screen.",
      topics: [
        {
          label: "Meetings",
          title: "Screen shares",
          description: "Zoom, Google Meet, Microsoft Teams and other meeting apps share your screen without it.",
        },
        {
          label: "Recording",
          title: "Screen recordings",
          description: "Recorders that capture your screen show what's underneath, not the overlay.",
        },
        {
          label: "Images",
          title: "Screenshots",
          description: "Screenshots of the whole screen leave the overlay out too.",
        },
      ],
    },
    steps: {
      eyebrow: "How it works",
      title: "Hidden in four steps.",
      lead: "No setting to change in your meeting app: the hiding happens in the operating system.",
      items: howSteps,
    },
    faq: {
      eyebrow: "FAQ",
      title: "Screen hider questions.",
      lead: "How hiding a window from screen share works.",
      items: [
        {
          question: "How can I hide a window during screen share?",
          answer:
            "Open what you want to hide inside iOverlay. It asks macOS or Windows to leave its window out of screen capture, so you can share your entire screen and that window isn't in it.",
        },
        {
          question: "Does the screen hider work with Zoom, Google Meet and Teams?",
          answer:
            "Yes. The hiding is done by the operating system, not the meeting app, so it works with Zoom, Google Meet, Microsoft Teams and other apps that share or record your screen.",
        },
        {
          question: "Is it hidden from screen recordings and screenshots too?",
          answer:
            "Yes, on macOS and Windows. On macOS 15 and later some capture tools have been reported to record it anyway, so test with the tools you use.",
        },
        {
          question: "Does it work on Linux?",
          answer:
            "A Linux version is coming soon, but Linux can't hide windows from screen capture, so the overlay will show in shares there.",
        },
      ],
    },
  },

  invisibleOverlay: {
    path: routes.invisibleOverlay,
    name: "Invisible overlay",
    seo: {
      title: "Invisible Overlay: Always-on-Top Window Hidden from Screen Share",
      description:
        "iOverlay is an invisible screen overlay: an always-on-top, see-through window for notes or any website that you can read and Zoom, Meet and Teams screen shares can't.",
      keywords: [
        "invisible overlay",
        "invisible screen overlay",
        "overlay app",
        "screen overlay app",
        "desktop overlay",
        "transparent overlay window",
        "always on top window",
        "see-through window",
        "click-through overlay",
        "undetectable overlay",
      ],
    },
    hero: {
      eyebrow: "Invisible overlay",
      title: "An overlay only you can see.",
      lead: "iOverlay is an invisible overlay for your desktop: an always-on-top, see-through window that stays on your screen and out of screen shares.",
    },
    shareLead: "Always on top for you, invisible to screen share.",
    callout: {
      label: "In one line:",
      text: "A floating, see-through window above every app that your audience never sees.",
    },
    features: {
      eyebrow: "The overlay",
      title: "Stays on top, stays out of the way.",
      lead: "A small panel you drag and resize anywhere, with controls that keep it out of your way.",
      topics: [
        {
          label: "On top",
          title: "Above every app",
          description: "It floats over every window, full-screen apps and every desktop included.",
        },
        {
          label: "See-through",
          title: "30 to 100% opacity",
          description: "Fade it until you can read what's underneath, and let clicks pass straight through.",
        },
        {
          label: "Shortcuts",
          title: "Control from anywhere",
          description: "Show, hide and toggle click-through with global keyboard shortcuts, whatever app has focus.",
        },
      ],
    },
    steps: {
      eyebrow: "How it works",
      title: "From open to invisible.",
      lead: "Four steps, from opening the overlay to presenting with it.",
      items: howSteps,
    },
    faq: {
      eyebrow: "FAQ",
      title: "Invisible overlay questions.",
      lead: "What makes the overlay invisible, and to whom.",
      items: [
        {
          question: "What is an invisible overlay?",
          answer:
            "A window that floats above your other apps and that you can see, but that screen shares, recordings and screenshots leave out. iOverlay is one, for macOS and Windows.",
        },
        {
          question: "Is the overlay transparent?",
          answer:
            "You set its opacity from 30 to 100%, and click-through lets mouse clicks pass to the window underneath, so you can work through it.",
        },
        {
          question: "Is it undetectable?",
          answer:
            "It's left out of screen capture on macOS and Windows, so viewers of a share don't see it. On macOS 15 and later some capture tools have been reported to record it anyway, and nothing hides it from a camera pointed at your screen.",
        },
        {
          question: "Which systems does it run on?",
          answer: "macOS 12 or later (Apple Silicon and Intel) and Windows 10 or 11, 64-bit. Linux is coming soon.",
        },
      ],
    },
  },

  embeddedChromeBrowser: {
    path: routes.embeddedChromeBrowser,
    name: "Embedded Chrome browser",
    seo: {
      title: "Embedded Chrome Browser Overlay: Floating Browser Hidden from Screen Share",
      description:
        "iOverlay has an embedded Chrome (Chromium) browser in a floating, always-on-top overlay. Open any website, doc or web app on top of your screen and keep it out of screen shares.",
      keywords: [
        "embedded chrome",
        "embedded chrome browser",
        "embedded browser",
        "embedded browser overlay",
        "chromium overlay",
        "floating browser window",
        "always on top browser",
        "picture in picture browser",
        "browser overlay for screen share",
        "hidden browser window",
      ],
    },
    hero: {
      eyebrow: "Embedded Chrome browser",
      title: "Any website, floating above your screen.",
      lead: "iOverlay has an embedded Chrome browser inside a private overlay. Open any site on top of your other apps, and keep it out of your screen shares.",
    },
    shareLead: "A floating Chrome browser, hidden from screen share.",
    callout: {
      label: "In one line:",
      text: "A Chromium browser in an always-on-top window that only you can see.",
    },
    features: {
      eyebrow: "The browser",
      title: "The web, in a private window.",
      lead: "Built on Chromium, the engine behind Google Chrome, so sites work the way they do in your usual browser.",
      topics: [
        {
          label: "Any site",
          title: "Docs, notes, dashboards",
          description: "Open Google Docs, Notion, a script, a dashboard or any web app inside the overlay.",
        },
        {
          label: "On top",
          title: "Floats above everything",
          description: "Unlike a normal browser tab, it stays above full-screen apps and slides while you present.",
        },
        {
          label: "Private",
          title: "Hidden from capture",
          description: "Screen shares, recordings and screenshots leave the browser window out.",
        },
      ],
    },
    steps: {
      eyebrow: "How it works",
      title: "Browse while you present.",
      lead: "Four steps, from opening the overlay to presenting with a site in view.",
      items: howSteps,
    },
    faq: {
      eyebrow: "FAQ",
      title: "Embedded browser questions.",
      lead: "What the browser inside iOverlay can do.",
      items: [
        {
          question: "What is an embedded Chrome browser?",
          answer:
            "A browser built into another app. iOverlay's is based on Chromium, the open-source engine behind Google Chrome, and lives inside the private overlay window.",
        },
        {
          question: "Can I open any website in it?",
          answer:
            "Yes: notes, Google Docs, Notion, a teleprompter script, a dashboard or any other site you can open in a browser.",
        },
        {
          question: "Is the browser window hidden when I share my screen?",
          answer:
            "Yes, on macOS and Windows the whole overlay, browser included, is left out of screen shares, recordings and screenshots.",
        },
        {
          question: "Does it stay on top of full-screen apps?",
          answer: "Yes. It floats above every app, full-screen slides and video calls included, on every desktop.",
        },
      ],
    },
  },
};

/** Every landing page, in the order they're linked. */
export const landingList: LandingPage[] = Object.values(landingPages);
