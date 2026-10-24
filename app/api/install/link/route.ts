// POST /api/install/link?installer=mac-arm64, with "Authorization: Bearer <token>": what the install
// scripts (../mac, ../windows) call to trade the one-time token from the welcome page's install
// command for a download link. The token is spent on the first call. Answers in plain text, which
// the scripts print as is.
//   200: a short-lived link to the installer · 401 when the token is missing, expired or used ·
//   400 for an unknown installer · 403 when the account's plan ended · 503 when the link can't be made

import { bearerToken, runTextRoute } from "@/server/core/baseRoute";
import { installService } from "@/server/features/download/module/downloadModule";

export async function POST(request: Request) {
  return runTextRoute(() =>
    installService.redeem(bearerToken(request), new URL(request.url).searchParams.get("installer")),
  );
}
