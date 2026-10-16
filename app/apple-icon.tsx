import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The home-screen icon for iPhone and iPad: app/icon.svg as a PNG, which Apple requires.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "app/icon.svg"), "base64");
  return new ImageResponse(
    <img src={`data:image/svg+xml;base64,${svg}`} width={size.width} height={size.height} alt="" />,
    size,
  );
}
