// Authorization for signed-in pages. proxy.ts already redirects on the cookie alone; these checks
// run next to the data, so a page stays protected even if the proxy matcher misses it, and an
// account deleted after signing in, or signed in again on another browser, loses access straight away.

import "server-only";
import { redirect } from "next/navigation";
import { homeRouteFor, routes, sessionEndedLink } from "@/helper/route";
import { HttpError } from "@/server/core/httpError";
import type { UserRole } from "@/server/features/user/schema/userSchema";
import { authService } from "../module/authModule";
import type { SessionUser } from "../service/authService";
import { readSession } from "../session/session";

/** The signed-in account, or null. Null too once the account has signed in on another browser. */
export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const session = await readSession();
  return session && authService.findWebSessionUser(session.userId, session.sid);
};

/**
 * The signed-in account. Signed-out visitors go to the sign-in page; with `role`, accounts without
 * that role go to their own home route.
 */
export const requireUser = async (role?: UserRole): Promise<SessionUser> => {
  const user = await getCurrentUser();
  // A cookie that's still signed but no longer valid (signed in elsewhere, account deleted) would
  // bounce between the proxy and here: sessionEndedLink has the proxy drop it and the page say why.
  if (!user) redirect((await readSession()) ? sessionEndedLink : routes.signIn);
  if (role && user.role !== role) redirect(homeRouteFor(user.role));
  return user;
};

/**
 * For Server Actions, which anyone can call directly: the signed-in admin, else a 401 or 403 that
 * runAction turns into a failed result (a redirect would be swallowed there).
 */
export const assertAdmin = async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) throw HttpError.unauthorized("Your session has ended. Sign in again.");
  if (user.role !== "admin") throw HttpError.forbidden("Only admins can do this.");
  return user;
};
