// Content blocks for email bodies, each matching a component on the website. Every block escapes
// the text it is given, so user input can be passed in directly. Wrap the result in layout().

import type { EmailAsset } from "../assets/emailAssets";
import { image } from "./images";
import { color, escapeHtml, font, label } from "./theme";

/** Red icon on a square ink tile, as on the contact page's "Email us" card. */
const iconTile = (icon: EmailAsset, side: number) =>
  `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="${side}" height="${side}" align="center" valign="middle" style="width:${side}px;height:${side}px;background:${color.ink}">${image(icon, "", "margin:0 auto")}</td></tr></table>`;

/** Short rule then a red label, like "—— CONTACT" above page headlines. */
const eyebrow = (text: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td valign="middle" style="padding-right:12px"><div style="width:32px;height:1px;line-height:1px;font-size:0;background:${color.ink}">&nbsp;</div></td>
    <td valign="middle" style="${label(11, 700, color.accent)}">${escapeHtml(text)}</td>
  </tr></table>`;

/** Icon tile, eyebrow, condensed uppercase headline and intro at the top of an email. */
export const hero = ({ icon, eyebrow: kicker, title, lead }: { icon: EmailAsset; eyebrow: string; title: string; lead: string }) =>
  `${iconTile(icon, 44)}
  <div style="margin:24px 0 0">${eyebrow(kicker)}</div>
  <h1 style="margin:12px 0 0;font-family:${font.display};font-size:34px;line-height:1;font-weight:700;letter-spacing:-0.03em;text-transform:uppercase;color:${color.ink}">${escapeHtml(title)}</h1>
  <p style="margin:14px 0 0;font-family:${font.sans};font-size:15px;line-height:1.6;color:${color.muted}">${escapeHtml(lead)}</p>`;

/** A code the reader should keep, such as a ticket, in an ink-bordered panel. */
export const codeCard = ({ label: name, value, note }: { label: string; value: string; note?: string }) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0 0;background:${color.canvas};border:1px solid ${color.ink}">
    <tr><td style="padding:20px 24px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td valign="middle" style="padding-right:12px">${iconTile("tile-ticket", 32)}</td>
        <td valign="middle" style="${label(11)}">${escapeHtml(name)}</td>
      </tr></table>
      <div style="margin:14px 0 0;font-family:${font.mono};font-size:26px;font-weight:700;letter-spacing:.08em;color:${color.ink}">${escapeHtml(value)}</div>
      ${note ? `<div style="margin:6px 0 0;font-family:${font.sans};font-size:13px;line-height:1.5;color:${color.muted}">${escapeHtml(note)}</div>` : ""}
    </td></tr>
  </table>`;

/** Section heading: monospace label over an ink rule, like "BEFORE YOU WRITE". */
export const sectionTitle = (text: string) =>
  `<div style="margin:36px 0 0;padding:0 0 10px;border-bottom:1px solid ${color.ink};${label(11, 700, color.ink)}">${escapeHtml(text)}</div>`;

export interface DetailRow {
  icon: EmailAsset;
  label: string;
  value: string;
  /** Makes the value a link, e.g. mailto: or tel:. */
  href?: string;
}

/** Field rows separated by hairlines: icon and monospace label, then the value. */
export const detailsList = (rows: DetailRow[]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rows
    .map(({ icon, label: name, value, href }) => {
      const border = `border-bottom:1px solid ${color.hairline};`;
      const content = href
        ? `<a href="${escapeHtml(href)}" style="color:${color.ink};text-decoration:underline">${escapeHtml(value)}</a>`
        : escapeHtml(value);
      return `<tr>
        <td width="24" valign="middle" style="width:24px;padding:13px 0;${border}">${image(icon)}</td>
        <td width="104" valign="middle" style="width:104px;padding:13px 12px 13px 0;${border}${label(11)}">${escapeHtml(name)}</td>
        <td valign="middle" style="padding:13px 0;${border}font-family:${font.sans};font-size:14px;font-weight:700;color:${color.ink};word-break:break-word">${content}</td>
      </tr>`;
    })
    .join("")}</table>`;

/** User-written text in a paper panel with a red rule, keeping its line breaks. */
export const messageCard = (text: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0 0">
    <tr><td style="padding:16px 20px;background:${color.canvas};border-left:2px solid ${color.accent};font-family:${font.sans};font-size:14px;line-height:1.65;color:${color.ink};white-space:pre-wrap;word-break:break-word">${escapeHtml(text)}</td></tr>
  </table>`;

/** Numbered steps like the "Get iOverlay" page: red rule, "01 · TITLE", then the detail. */
export const steps = (items: { title: string; text: string }[]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">${items
    .map(
      ({ title, text }, index) => `<tr><td style="padding:18px 0;${index < items.length - 1 ? `border-bottom:1px solid ${color.hairline};` : ""}">
        <div style="width:32px;height:2px;line-height:2px;font-size:0;background:${color.accent}">&nbsp;</div>
        <div style="margin:12px 0 0;${label(12, 700, color.ink)}">${String(index + 1).padStart(2, "0")} · ${escapeHtml(title)}</div>
        <div style="margin:6px 0 0;font-family:${font.sans};font-size:14px;line-height:1.6;color:${color.muted}">${escapeHtml(text)}</div>
      </td></tr>`,
    )
    .join("")}</table>`;

/**
 * Solid red square button with an uppercase monospace label. `icon` goes before the label, like
 * "SEND MESSAGE"; `trailingIcon` after it, like "START CHECKOUT ↓".
 */
export const button = ({
  href,
  label: text,
  icon,
  trailingIcon,
}: {
  href: string;
  label: string;
  icon?: EmailAsset;
  trailingIcon?: EmailAsset;
}) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0 0"><tr>
    <td style="background:${color.accent}">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:15px 22px;text-decoration:none">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          ${icon ? `<td valign="middle" style="padding-right:10px">${image(icon)}</td>` : ""}
          <td valign="middle" style="${label(13, 700, color.paper)}">${escapeHtml(text)}</td>
          ${trailingIcon ? `<td valign="middle" style="padding-left:10px">${image(trailingIcon)}</td>` : ""}
        </tr></table>
      </a>
    </td>
  </tr></table>`;

/** A plain paragraph of body text. */
export const paragraph = (text: string) =>
  `<p style="margin:16px 0 0;font-family:${font.sans};font-size:15px;line-height:1.6;color:${color.ink}">${escapeHtml(text)}</p>`;

/** The same rows as plain text, for the text body. */
export const detailsText = (rows: { label: string; value: string }[]) =>
  rows.map(({ label: name, value }) => `${name}: ${value}`).join("\n");
