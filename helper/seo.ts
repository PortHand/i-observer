// Search and social metadata shared by every page: the site-wide defaults the root layout sets,
// pageMetadata for each public page, and the schema.org structured data rendered by <JsonLd>.
// Server only: it reads SITE_URL. Share images are the opengraph-image.tsx files beside the pages.

import type { Metadata } from "next";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { env } from "@/server/core/env";
import { routes } from "./route";

export const seo = {
  /** Home page title and the fallback for pages without one. */
  defaultTitle: `${appInfo.name}: Private Screen Overlay Hidden from Screen Share`,
  /** Other pages: "Contact | iOverlay". */
  titleTemplate: `%s | ${appInfo.name}`,
  description:
    "iOverlay is a desktop overlay for your notes, docs or any website that stays hidden from Zoom, Google Meet, Teams, screen recordings and screenshots. For macOS, with Windows and Linux coming soon.",
  keywords: [
    "iOverlay",
    "screen share overlay",
    "invisible overlay",
    "hide window from screen share",
    "hidden notes during screen share",
    "private presenter notes",
    "teleprompter for Zoom",
    "Zoom notes overlay",
    "Google Meet notes",
    "Microsoft Teams notes",
    "capture-protected window",
    "screen recording hidden window",
  ],
  locale: "en_IN",
  /** Browser UI colour: the site's ink. */
  themeColor: "#242321",
  backgroundColor: "#e9e9e5",
  /** Shown alongside the share image. */
  imageAlt: `${appInfo.name}: ${appInfo.tagline}`,
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
export function pageMetadata({ title, absoluteTitle, description, path, index = true, ownShareImage }: PageSeo): Metadata {
  // Leave the key out entirely for pages with their own image: even `images: undefined` hides it.
  const images = ownShareImage ? {} : { images: [defaultShareImage] };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
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
  operatingSystem: "macOS 12 or later",
  softwareVersion: appInfo.version,
  image: absoluteUrl("/opengraph-image"),
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

/** Home → this page, for the breadcrumb trail search results show under the title. */
export const breadcrumbJsonLd = (name: string, path: string): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl(routes.home) },
    { "@type": "ListItem", position: 2, name, item: absoluteUrl(path) },
  ],
});
