// Embedded images (logo and icons from ../assets). Email clients don't load SVG and many block
// remote images, so each image the HTML uses is attached to the email and referenced by content ID.

import { emailAssets, type EmailAsset } from "../assets/emailAssets";
import type { MailAttachment } from "../transport/mailTransport";
import { escapeHtml } from "./theme";

const CID_DOMAIN = "ioverlay";

/** An embedded image from ../assets, shown at its display size. */
export const image = (name: EmailAsset, alt = "", style = "") => {
  const { size } = emailAssets[name];
  return `<img src="cid:${name}@${CID_DOMAIN}" width="${size}" height="${size}" alt="${escapeHtml(alt)}" style="display:block;border:0;outline:none;width:${size}px;height:${size}px;${style}">`;
};

/** Attachments for every embedded image the HTML uses, so the images show without hosting. */
export const inlineImages = (html: string): MailAttachment[] => {
  const names = new Set([...html.matchAll(new RegExp(`cid:([\\w-]+)@${CID_DOMAIN}`, "g"))].map((match) => match[1]));
  return [...names]
    .filter((name): name is EmailAsset => name in emailAssets)
    .map((name) => ({
      filename: `${name}.png`,
      content: Buffer.from(emailAssets[name].png, "base64"),
      contentType: "image/png",
      cid: `${name}@${CID_DOMAIN}`,
    }));
};
