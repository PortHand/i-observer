// POST /api/app/sign-in: the desktop app's sign-in (iobserver-app/src/main/auth.ts).
//   Body: { "username": string, "password": string } as JSON.
//   200: { token, expiresAt, user, access }. Send the token as "Authorization: Bearer <token>".
//   400 invalid input · 401 wrong username or password · 403 plan ended · 429 too many attempts
//   (with retryAfter in seconds and a Retry-After header). Same limits as the website's sign-in.

import { form } from "@/app/(view)/(pview)/sign-in/content/signInContent";
import { isValidUsername, normalizeUsername } from "@/app/(view)/(pview)/sign-in/helper/signInHelper";
import { assertValid } from "@/server/core/baseAction";
import { readJson, runRoute } from "@/server/core/baseRoute";
import { clientIp } from "@/server/core/clientIp";
import type { FieldErrors } from "@/server/core/httpError";
import { appAuthService } from "@/server/features/auth/module/authModule";

/** Longest password accepted, so a huge one can't be used to slow the server down. */
const MAX_PASSWORD_LENGTH = 256;

export async function POST(request: Request) {
  return runRoute(async () => {
    const body = await readJson(request);
    const username = normalizeUsername(typeof body.username === "string" ? body.username : "");
    // Passwords are compared as typed, spaces included.
    const password = typeof body.password === "string" ? body.password : "";

    const fields: FieldErrors = {};
    if (!isValidUsername(username)) fields.username = form.errors.usernameInvalid;
    if (!password || password.length > MAX_PASSWORD_LENGTH) fields.password = form.errors.passwordMissing;
    assertValid(fields);

    return appAuthService.signIn(username, password, clientIp(request.headers));
  });
}
