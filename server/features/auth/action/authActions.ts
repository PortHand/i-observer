"use server";

// Server Actions for signing in and out, called from the Sign in page's service (no app/api route).

import { redirect } from "next/navigation";
import { isValidUsername, normalizeUsername } from "@/app/(view)/(pview)/sign-in/helper/signInHelper";
import { form } from "@/app/(view)/(pview)/sign-in/content/signInContent";
import { homeRouteFor, routes } from "@/helper/route";
import { assertValid, runAction } from "@/server/core/baseAction";
import type { FieldErrors } from "@/server/core/httpError";
import { authService } from "../module/authModule";
import { toSessionUser } from "../service/authService";
import { createSession, deleteSession } from "../session/session";

/**
 * Checks the credentials and sets the sign-in cookie. Returns the account and the page to open
 * next, which depends on its role.
 */
export async function signIn(username: string, password: string) {
  return runAction(async () => {
    const name = normalizeUsername(String(username ?? ""));
    const secret = String(password ?? "");
    const fields: FieldErrors = {};
    if (!isValidUsername(name)) fields.username = form.errors.usernameInvalid;
    if (!secret) fields.password = form.errors.passwordMissing;
    assertValid(fields);

    const user = await authService.verify(name, secret);
    await createSession(user);
    return { user: toSessionUser(user), redirectTo: homeRouteFor(user.role) };
  });
}

/** Clears the sign-in cookie and goes back to the sign-in page. */
export async function signOut() {
  await deleteSession();
  redirect(routes.signIn);
}
