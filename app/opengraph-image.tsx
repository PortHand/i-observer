import { shareImage, shareImageSize, shareImageType } from "@/helper/shareImage";
import { appInfo, hero } from "./(view)/(pview)/home/content/homeContent";
import { seo } from "@/helper/seo";

// The share image for the home page, and for any page without its own opengraph-image.
export const alt = seo.imageAlt;
export const size = shareImageSize;
export const contentType = shareImageType;

export default function Image() {
  return shareImage({
    eyebrow: appInfo.tagline,
    heading: `${hero.titleStart} ${hero.titleAccent} ${hero.titleEnd}`,
    lead: "Notes, docs or any website on your screen, hidden from screen share.",
  });
}
