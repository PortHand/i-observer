// GET /api/intro-video: the intro video, for the home and welcome pages and the iobserver-app Home
// page. The file sits in a private bucket (assets/intro.mp4), so this answers with a redirect to a
// short-lived signed link; players follow it and stream from Supabase with range requests.
//   302 → signed link · 503 when the link can't be made (Supabase not set up, or the file is missing)

import { connection } from "next/server";
import { assetStorage } from "@/server/features/storage/module/storageModule";

const INTRO_VIDEO_PATH = "assets/intro.mp4";

/** How long a signed link works: long enough to watch, seek and pause through the whole video. */
const LINK_SECONDS = 6 * 60 * 60;

/** A link is reused for this long before signing a new one, so most plays skip the Supabase call. */
const REUSE_SECONDS = 60 * 60;

let cached: { url: string; expiresAt: number } | null = null;

async function introVideoUrl(): Promise<string | null> {
  if (cached && cached.expiresAt > Date.now()) return cached.url;
  const url = await assetStorage.signedUrl(INTRO_VIDEO_PATH, LINK_SECONDS);
  cached = url ? { url, expiresAt: Date.now() + REUSE_SECONDS * 1000 } : null;
  return url;
}

export async function GET() {
  // Signed per request (or from the cache above), never at build time.
  await connection();
  const url = await introVideoUrl();
  if (!url) {
    return Response.json(
      { error: "The video isn't available right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  // The browser may reuse the redirect while the link it points at still has hours left.
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": `private, max-age=${REUSE_SECONDS}` },
  });
}
