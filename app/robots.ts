import type { MetadataRoute } from "next";
import { secureRoot } from "@/helper/route";
import { absoluteUrl, siteUrl } from "@/helper/seo";

// Served at /robots.txt. Signed-in pages are private, so crawlers skip them. Sign-in isn't blocked
// here: crawlers have to load it to see its noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [`${secureRoot}/`] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
