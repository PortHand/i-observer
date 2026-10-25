import { shareImage, shareImageSize, shareImageType } from "@/helper/shareImage";
import { intro } from "./content/promptsContent";

export const alt = "Interview practice prompts for developers";
export const size = shareImageSize;
export const contentType = shareImageType;

export default function Image() {
  return shareImage({
    eyebrow: intro.eyebrow,
    heading: intro.title,
    lead: "Mock interview prompts for React, Flutter, MERN and SDE roles.",
  });
}
