import { shareImage, shareImageSize, shareImageType } from "@/helper/shareImage";
import { intro, oneLine } from "./content/whatIsContent";

export const alt = intro.title;
export const size = shareImageSize;
export const contentType = shareImageType;

export default function Image() {
  return shareImage({ eyebrow: intro.eyebrow, heading: intro.title, lead: oneLine.text });
}
