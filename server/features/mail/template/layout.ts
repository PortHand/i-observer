// The frame around every email: utility bar, logo header, ink-bordered paper card and footer.

import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { image } from "./images";
import { color, escapeHtml, font, label, siteLink, siteUrl } from "./theme";

// Invisible padding after the preheader, so inboxes don't fill the preview with body text.
const PREVIEW_PADDING = "&#8199;&#847; ".repeat(80);

/**
 * Wraps body HTML in the site's frame: utility bar, logo header, ink-bordered paper card and
 * footer. `preheader` is the preview line inboxes show after the subject; `footerNote` says why
 * the reader got this email.
 */
export const layout = ({ preheader, body, footerNote }: { preheader: string; body: string; footerNote: string }) => {
  const footerLink = (href: string, text: string) =>
    `<a href="${escapeHtml(href)}" style="${label(11, 700, color.ink)};text-decoration:underline;white-space:nowrap">${escapeHtml(text)}</a>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(appInfo.name)}</title>
  <style>
    @media (max-width: 620px) {
      .card-body { padding: 28px 20px !important; }
      .shell { padding: 0 8px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${color.canvas};font-family:${font.sans};-webkit-font-smoothing:antialiased">
  <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all">${escapeHtml(preheader)}${PREVIEW_PADDING}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${color.canvas}">
    <tr><td align="center" class="shell" style="padding:0 16px">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px">

        <tr><td style="padding:14px 0;border-bottom:1px solid ${color.hairline}">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
            <td style="${label(10, 700, color.ink)}">${escapeHtml(appInfo.name)}</td>
            <td align="right" style="${label(10, 400, color.muted)}">${escapeHtml(appInfo.utility)}</td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:20px 0 24px">
          <a href="${escapeHtml(siteLink())}" style="text-decoration:none">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td valign="middle" style="padding-right:12px">${image("logo", appInfo.name)}</td>
              <td valign="middle">
                <div style="font-family:${font.sans};font-size:17px;font-weight:700;color:${color.ink}">${escapeHtml(appInfo.name)}</div>
                <div style="margin:2px 0 0;${label(10, 400, color.muted)}">${escapeHtml(appInfo.tagline)}</div>
              </td>
            </tr></table>
          </a>
        </td></tr>

        <tr><td class="card-body" style="padding:40px 40px 44px;background:${color.surface};border:1px solid ${color.ink}">${body}</td></tr>

        <tr><td style="padding:24px 0 40px">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="padding:0 0 14px;border-bottom:1px solid ${color.hairline}">
              ${footerLink(siteLink("/contact#faq"), "Help & FAQ")}
              <span style="${label(11, 400, color.subtle)}">&nbsp;·&nbsp;</span>
              ${footerLink(`mailto:${appInfo.supportEmail}`, appInfo.supportEmail)}
              <span style="${label(11, 400, color.subtle)}">&nbsp;·&nbsp;</span>
              ${footerLink(siteLink(), siteUrl.replace(/^https?:\/\//, ""))}
            </td></tr>
            <tr><td style="padding:14px 0 0;font-family:${font.sans};font-size:12px;line-height:1.7;color:${color.muted}">
              ${escapeHtml(footerNote)}<br>
              <span style="${label(10, 400, color.subtle)}">© ${new Date().getFullYear()} ${escapeHtml(appInfo.name)} · ${escapeHtml(appInfo.utility)}</span>
            </td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};
