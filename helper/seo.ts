// Search and social metadata shared by every page: the site-wide defaults the root layout sets,
// pageMetadata for each public page, and the schema.org structured data rendered by <JsonLd>.
// Server only: it reads SITE_URL. Share images are the opengraph-image.tsx files beside the pages.

import type { Metadata } from "next";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { env } from "@/server/core/env";
import { routes } from "./route";

export const seo = {
  /** Home page title and the fallback for pages without one. */
  defaultTitle: `${appInfo.name}: Invisible Screen Overlay & Screen Hider for Zoom, Meet and Teams`,
  /** Other pages: "Contact | iOverlay". */
  titleTemplate: `%s | ${appInfo.name}`,
  description:
    "iOverlay is an invisible screen overlay with an embedded Chrome browser: keep notes, docs or any website on your screen while Zoom, Google Meet, Teams, recordings and screenshots leave it out. A screen hider and interview helper for macOS and Windows.",
  keywords: [
    "iOverlay",
    "i overlay",
    "overlay",
    "screen overlay",
    "invisible overlay",
    "invisible screen overlay",
    "screen share overlay",
    "desktop overlay app",
    "transparent overlay window",
    "always on top overlay",
    "screen hider",
    "screen hider app",
    "hide window from screen share",
    "hide app from screen share",
    "hide screen during screen share",
    "embedded chrome",
    "embedded chrome browser",
    "embedded browser overlay",
    "floating browser window",
    "always on top browser",
    "interview helper",
    "interview helper app",
    "online interview helper",
    "interview notes overlay",
    "video interview notes",
    "hidden notes during screen share",
    "private presenter notes",
    "teleprompter for Zoom",
    "hidden teleprompter",
    "Zoom notes overlay",
    "Google Meet notes",
    "Microsoft Teams notes",
    "capture-protected window",
    "hidden from screen recording",
    "screenshot proof window",
    "undetectable overlay",
  ],
  locale: "en_IN",
  /** Browser UI colour: the site's night canvas. */
  themeColor: "#07070c",
  backgroundColor: "#07070c",
  /** Shown alongside the share image. */
  imageAlt: `${appInfo.name}: ${appInfo.tagline}`,
};

/**
 * Ownership tokens from the search consoles, set in the environment so each can be added without a
 * code change. Each becomes a <meta> tag in every page's head; unset ones are left out.
 */
export const siteVerification = (): Metadata["verification"] => {
  const other = Object.fromEntries(
    Object.entries({
      "msvalidate.01": env.verification.bing,
      "p:domain_verify": env.verification.pinterest,
      "facebook-domain-verification": env.verification.facebook,
    }).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
  return {
    ...(env.verification.google && { google: env.verification.google }),
    ...(env.verification.yandex && { yandex: env.verification.yandex }),
    ...(Object.keys(other).length > 0 && { other }),
  };
};

/** The public address of the site, without a trailing slash. */
export const siteUrl = () => env.siteUrl;

/** Absolute URL of a path on this site: "/contact" → "https://i-overlay.com/contact". */
export const absoluteUrl = (path: string) => new URL(path, `${siteUrl()}/`).toString();

interface PageSeo {
  /** Page title; the template adds " | iOverlay" unless absoluteTitle is set. */
  title: string;
  absoluteTitle?: boolean;
  description: string;
  /** The page's path, used as its canonical URL. */
  path: string;
  /** Page-specific search terms, added to the site-wide ones. */
  keywords?: string[];
  /** false keeps the page out of search results (links on it are still followed). */
  index?: boolean;
  /**
   * True when the page has its own opengraph-image.tsx beside it. Otherwise it gets the site-wide
   * image: images set here would replace the page's own file.
   */
  ownShareImage?: boolean;
}

/** The site-wide share image, app/opengraph-image.tsx, for pages without their own. */
const defaultShareImage = { url: "/opengraph-image", width: 1200, height: 630, alt: seo.imageAlt };

/**
 * Metadata for one public page. Next merges openGraph and twitter as whole objects, so a page that
 * set only its title there would lose the site-wide fields (the share image included): this fills
 * them all in.
 */
export function pageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  keywords,
  index = true,
  ownShareImage,
}: PageSeo): Metadata {
  // Leave the key out entirely for pages with their own image: even `images: undefined` hides it.
  const images = ownShareImage ? {} : { images: [defaultShareImage] };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords && { keywords: [...new Set([...keywords, ...seo.keywords])] }),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: appInfo.name,
      locale: seo.locale,
      url: path,
      title,
      description,
      ...images,
    },
    twitter: { card: "summary_large_image", title, description, ...images },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}

// Structured data (https://schema.org), rendered as JSON-LD by components/common/JsonLd.tsx.

type JsonLdObject = Record<string, unknown>;

const organizationId = () => `${siteUrl()}/#organization`;
const websiteId = () => `${siteUrl()}/#website`;

/** Who runs the site, and how to reach support. On every page, from the root layout. */
export const organizationJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId(),
  name: appInfo.name,
  url: siteUrl(),
  logo: absoluteUrl("/logo.svg"),
  email: appInfo.supportEmail,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: appInfo.supportEmail,
    url: absoluteUrl(routes.contact),
    availableLanguage: ["English"],
  },
});

/** The site itself. On every page, from the root layout. */
export const websiteJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": websiteId(),
  name: appInfo.name,
  url: siteUrl(),
  description: seo.description,
  inLanguage: "en-IN",
  publisher: { "@id": organizationId() },
});

/** The desktop app, with an offer per plan on sale. Prices are in rupees. */
export const softwareJsonLd = (plans: { name: string; amount: number }[]): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: appInfo.name,
  url: siteUrl(),
  description: seo.description,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Screen overlay",
  operatingSystem: "macOS 12 or later, Windows 10 or 11",
  softwareVersion: appInfo.version,
  image: absoluteUrl("/opengraph-image"),
  screenshot: absoluteUrl("/intro-banner.jpg"),
  keywords: seo.keywords.join(", "),
  featureList: [
    "Invisible overlay hidden from Zoom, Google Meet and Microsoft Teams screen shares",
    "Screen hider: left out of screen recordings and screenshots",
    "Embedded Chrome (Chromium) browser for notes, docs or any website",
    "Interview helper: private notes during video interviews",
    "Adjustable opacity from 30 to 100%",
    "Click-through mode",
    "Global keyboard shortcuts",
  ],
  publisher: { "@id": organizationId() },
  ...(plans.length > 0 && {
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.amount,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(routes.getIOverlay),
    })),
  }),
});

/** Questions and answers shown on a page. */
export const faqJsonLd = (faqs: { question: string; answer: string }[]): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
});

/** A video shown on a page, so it can appear in video search. */
export const videoJsonLd = (video: {
  name: string;
  description: string;
  path: string;
  thumbnailPath: string;
  uploadDate: string;
}): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: video.name,
  description: video.description,
  thumbnailUrl: absoluteUrl(video.thumbnailPath),
  contentUrl: absoluteUrl(video.path),
  uploadDate: video.uploadDate,
  publisher: { "@id": organizationId() },
});

/** A numbered set of steps, e.g. how to use the overlay. */
export const howToJsonLd = (name: string, steps: { label: string; description: string }[]): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name,
  step: steps.map(({ label, description }, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: label,
    text: description,
  })),
});

/** Home → this page, for the breadcrumb trail search results show under the title. */
export const breadcrumbJsonLd = (name: string, path: string): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl(routes.home) },
    { "@type": "ListItem", position: 2, name, item: absoluteUrl(path) },
  ],
});
