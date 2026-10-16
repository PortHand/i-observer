import type { MetadataRoute } from "next";
import { routes } from "@/helper/route";
import { absoluteUrl } from "@/helper/seo";

// Served at /sitemap.xml. Public pages that should show up in search: sign-in and everything under
// /sview stay out (see robots.ts). Add new public pages here.
const pages: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
  { path: routes.home, changeFrequency: "weekly", priority: 1 },
  { path: routes.whatIsIOverlay, changeFrequency: "monthly", priority: 0.9 },
  { path: routes.getIOverlay, changeFrequency: "weekly", priority: 0.9 },
  { path: routes.contact, changeFrequency: "monthly", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return pages.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
