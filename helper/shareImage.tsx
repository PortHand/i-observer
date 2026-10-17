// The image shown when a page is shared on social apps and chat (Open Graph / X cards). Each
// page's opengraph-image.tsx calls shareImage with its own heading, so they all look alike: the
// logo, a heading and the tagline on paper, with an ink rule and the site's red accent.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";

export const shareImageSize = { width: 1200, height: 630 };
export const shareImageType = "image/png";

const colors = { ink: "#242321", paper: "#e9e9e5", muted: "#615f5a", accent: "#c83232" };

/** The site logo (app/icon.svg), inlined so the image needs no request. */
const logo = readFile(join(process.cwd(), "app/icon.svg"), "base64").then(
  (data) => `data:image/svg+xml;base64,${data}`,
);

interface ShareImage {
  /** Small label above the heading, e.g. "Contact". */
  eyebrow: string;
  heading: string;
  /** One line under the heading. */
  lead: string;
}

export async function shareImage({ eyebrow, heading, lead }: ShareImage) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: colors.paper,
          color: colors.ink,
          borderTop: `16px solid ${colors.accent}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={await logo} width={88} height={88} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 44, fontWeight: 700 }}>{appInfo.name}</span>
            <span style={{ fontSize: 24, color: colors.muted }}>{appInfo.utility}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 26, color: colors.accent, textTransform: "uppercase", letterSpacing: 4 }}>
            {eyebrow}
          </span>
          <span style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1 }}>{heading}</span>
          <span style={{ fontSize: 32, color: colors.muted, lineHeight: 1.3 }}>{lead}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `3px solid ${colors.ink}`,
            paddingTop: 20,
            fontSize: 24,
          }}
        >
          <span>macOS · Windows and Linux soon</span>
          <span>Hidden from Zoom · Meet · Teams</span>
        </div>
      </div>
    ),
    shareImageSize,
  );
}
