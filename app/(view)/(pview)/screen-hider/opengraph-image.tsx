import { shareImage, shareImageSize, shareImageType } from "@/helper/shareImage";
import { landingPages } from "../_landing/content/landingContent";

const page = landingPages.screenHider;

export const alt = page.seo.title;
export const size = shareImageSize;
export const contentType = shareImageType;

export default function Image() {
  return shareImage({ eyebrow: page.hero.eyebrow, heading: page.hero.title, lead: page.shareLead });
}
