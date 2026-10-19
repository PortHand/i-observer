// GET /api/app/session: checks the desktop app's sign-in on launch.
//   Header: "Authorization: Bearer <token>" from POST /api/app/sign-in.
//   200: { user, access } · 401 signed out (bad or expired token, account gone, password changed,
//   signed in on another computer)
//   · 403 plan ended. The app forgets its token on 401 and 403.

import { connection } from "next/server";
import { bearerToken, runRoute } from "@/server/core/baseRoute";
import { appAuthService } from "@/server/features/auth/module/authModule";

export async function GET(request: Request) {
  // Checked per request, never prerendered: the answer depends on the token and the clock.
  await connection();
  return runRoute(() => appAuthService.session(bearerToken(request)));
}
