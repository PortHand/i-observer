"use server";

// Server Actions for signing in and out, called from the Sign in page's service (no app/api route).

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isValidUsername, normalizeUsername } from "@/app/(view)/(pview)/sign-in/helper/signInHelper";
import { form } from "@/app/(view)/(pview)/sign-in/content/signInContent";
import { homeRouteFor, routes } from "@/helper/route";
import { assertValid, runAction } from "@/server/core/baseAction";
import { clientIp } from "@/server/core/clientIp";
import type { FieldErrors } from "@/server/core/httpError";
import { authService } from "../module/authModule";
import { toSessionUser } from "../service/authService";
import { createSession, deleteSession, readSession } from "../session/session";

/**
 * Checks the credentials (within the failed-attempt limits, see SignInLimiter) and sets the sign-in
 * cookie. An account has one website sign-in at a time: this one ends any on another browser. Returns the account and the page to open next, which depends on its role.
 */
export async function signIn(username: string, password: string) {
  return runAction(async () => {
    const name = normalizeUsername(String(username ?? ""));
    const secret = String(password ?? "");
    const fields: FieldErrors = {};
    if (!isValidUsername(name)) fields.username = form.errors.usernameInvalid;
    if (!secret) fields.password = form.errors.passwordMissing;
    assertValid(fields);

    const user = await authService.signIn(name, secret, clientIp(await headers()));
    await createSession(user, await authService.startSession(user.id, "web"));
    return { user: toSessionUser(user), redirectTo: homeRouteFor(user.role) };
  });
}

/** Ends this sign-in, clears the cookie and goes back to the sign-in page. */
export async function signOut() {
  const session = await readSession();
  if (session) await authService.endSession(session.userId, "web", session.sid);
  await deleteSession();
  redirect(routes.signIn);
}
