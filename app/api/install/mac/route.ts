// GET /api/install/mac: the bash script behind the welcome page's Terminal command,
// `curl -fsSL …/api/install/mac | bash -s -- <token>`. Public and free of secrets (see
// server/features/download/script/installScripts.ts); plain text, so it opens in a browser for
// anyone who wants to read it first.

import { connection } from "next/server";
import { env } from "@/server/core/env";
import { macInstallScript } from "@/server/features/download/script/installScripts";

export async function GET() {
  // Built per request, so it carries this deployment's SITE_URL rather than the build machine's.
  await connection();
  return new Response(macInstallScript(env.siteUrl), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
