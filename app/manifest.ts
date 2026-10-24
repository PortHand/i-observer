import type { MetadataRoute } from "next";
import { routes } from "@/helper/route";
import { seo } from "@/helper/seo";
import { appInfo } from "./(view)/(pview)/home/content/homeContent";

// Served at /manifest.webmanifest: the name, colours and icons browsers use for the site.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appInfo.name,
    short_name: appInfo.name,
    description: seo.description,
    start_url: routes.home,
    display: "browser",
    background_color: seo.backgroundColor,
    theme_color: seo.themeColor,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon1.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
