import type { MetadataRoute } from "next";
import { routes } from "@/helper/route";
import { absoluteUrl } from "@/helper/seo";
import { demo } from "./(view)/(pview)/home/content/homeContent";

// Served at /sitemap.xml. Public pages that should show up in search: sign-in and everything under
// /sview stay out (see robots.ts). Add new public pages here.
const pages: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
  { path: routes.home, changeFrequency: "weekly", priority: 1 },
  { path: routes.whatIsIOverlay, changeFrequency: "monthly", priority: 0.9 },
  { path: routes.getIOverlay, changeFrequency: "weekly", priority: 0.9 },
  { path: routes.interviewHelper, changeFrequency: "monthly", priority: 0.8 },
  { path: routes.screenHider, changeFrequency: "monthly", priority: 0.8 },
  { path: routes.invisibleOverlay, changeFrequency: "monthly", priority: 0.8 },
  { path: routes.embeddedChromeBrowser, changeFrequency: "monthly", priority: 0.8 },
  { path: routes.prompts, changeFrequency: "monthly", priority: 0.7 },
  { path: routes.contact, changeFrequency: "monthly", priority: 0.6 },
];

/**
 * Images listed for the home page: its share image and the demo poster. Other pages' share images
 * get a hashed URL from Next (/contact/opengraph-image-1a2b3c), so they're found through the page.
 */
const homeImages = () => [absoluteUrl("/opengraph-image"), absoluteUrl(demo.videoPoster)];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return pages.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
    ...(path === routes.home && { images: homeImages() }),
  }));
}
