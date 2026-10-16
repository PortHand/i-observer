import { shareImage, shareImageSize, shareImageType } from "@/helper/shareImage";
import { getApp } from "./content/getContent";

export const alt = "Get iOverlay";
export const size = shareImageSize;
export const contentType = shareImageType;

export default function Image() {
  return shareImage({
    eyebrow: getApp.eyebrow,
    heading: getApp.title,
    lead: "Pick a plan, pay by UPI and get your login within 24 hours.",
  });
}
