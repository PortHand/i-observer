// Building blocks for email templates. A template is a function from its data to a subject and
// bodies, so any feature can define its own next to its code (see contact/template) and send it
// with mailService.sendTemplate.

import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";

export interface MailContent {
  subject: string;
  text: string;
  html: string;
}

export type MailTemplate<T> = (data: T) => MailContent;

/** Escapes text for HTML. Use it on anything a user typed. */
export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** Label and value rows, e.g. the details of an order. Values are escaped. */
export const detailsTable = (rows: [label: string, value: string][]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #d6d5d0;color:#615f5a;font-size:12px;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #d6d5d0;font-family:Menlo,Consolas,monospace;font-size:14px">${escapeHtml(value)}</td></tr>`,
    )
    .join("")}</table>`;

/** The same rows as plain text, for the text body. */
export const detailsText = (rows: [label: string, value: string][]) =>
  rows.map(([label, value]) => `${label}: ${value}`).join("\n");

/** A quoted block of user-written text, keeping its line breaks. */
export const quoteHtml = (text: string) =>
  `<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #c83232;background:#f5f4f1;white-space:pre-wrap">${escapeHtml(text)}</blockquote>`;

/**
 * Wraps body HTML in the shared iObserver layout. Inline styles only: most email clients drop
 * <style> blocks. `preheader` is the preview line inboxes show after the subject.
 */
export const layout = ({ preheader, body }: { preheader: string; body: string }) => `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f4f1;color:#242321;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55">
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f4f1">
      <tr><td align="center" style="padding:24px 12px">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-top:3px solid #c83232">
          <tr><td style="padding:24px 28px 8px;font-family:Menlo,Consolas,monospace;font-size:12px;font-weight:bold;letter-spacing:.12em;color:#c83232">IOBSERVER</td></tr>
          <tr><td style="padding:8px 28px 28px">${body}</td></tr>
          <tr><td style="padding:16px 28px;border-top:1px solid #d6d5d0;color:#615f5a;font-size:12px">${escapeHtml(appInfo.name)} · <a href="mailto:${appInfo.supportEmail}" style="color:#615f5a">${appInfo.supportEmail}</a></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
