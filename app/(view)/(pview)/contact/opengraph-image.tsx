import { shareImage, shareImageSize, shareImageType } from "@/helper/shareImage";
import { intro } from "./content/contactContent";

export const alt = "Contact iOverlay support";
export const size = shareImageSize;
export const contentType = shareImageType;

export default function Image() {
  return shareImage({
    eyebrow: intro.eyebrow,
    heading: intro.title,
    lead: "Answers about screen sharing, UPI payments, logins and the app.",
  });
}
