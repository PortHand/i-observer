// Design tokens for emails, from the website's "paper & ink" theme (app/globals.css): warm paper
// backgrounds, ink text, one red accent, square corners, 1px ink rules and hairlines, heavy
// condensed uppercase headlines and uppercase monospace labels. Change the email look here.

// Design tokens from app/globals.css. Hairline is the 22% ink border flattened onto paper,
// since some email clients ignore transparent colors.
export const color = {
  canvas: "#e9e9e5",
  surface: "#f7f6f0",
  hairline: "#cac9c3",
  ink: "#242321",
  muted: "#615f5a",
  subtle: "#8a8780",
  accent: "#c83232",
  paper: "#f7f6f0",
};

export const font = {
  sans: "Arial,Helvetica,sans-serif",
  display: "'Arial Narrow','Helvetica Neue',Arial,sans-serif",
  mono: "ui-monospace,SFMono-Regular,Menlo,Consolas,'Courier New',monospace",
};

/** Uppercase monospace label style, used for eyebrows, field labels and buttons. */
export const label = (size = 11, weight = 700, tint = color.muted) =>
  `font-family:${font.mono};font-size:${size}px;font-weight:${weight};letter-spacing:.06em;text-transform:uppercase;color:${tint}`;

/** Website links in emails must be absolute. Set SITE_URL when the site moves. */
export const siteUrl = (process.env.SITE_URL ?? "https://i-overlay.com").replace(/\/$/, "");

export const siteLink = (path = "/") => `${siteUrl}${path}`;

/** Escapes text for HTML. Use it on anything a user typed. */
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
