// Authorization for signed-in pages. proxy.ts already redirects on the cookie alone; these checks
// run next to the data, so a page stays protected even if the proxy matcher misses it, and an
// account deleted after signing in loses access straight away.

import "server-only";
import { redirect } from "next/navigation";
import { homeRouteFor, routes } from "@/helper/route";
import type { UserRole } from "@/server/features/user/schema/userSchema";
import { authService } from "../module/authModule";
import type { SessionUser } from "../service/authService";
import { readSession } from "../session/session";

/** The signed-in account, or null. */
export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const session = await readSession();
  return session && authService.findUser(session.userId);
};

/**
 * The signed-in account. Signed-out visitors go to the sign-in page; with `role`, accounts without
 * that role go to their own home route.
 */
export const requireUser = async (role?: UserRole): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) redirect(routes.signIn);
  if (role && user.role !== role) redirect(homeRouteFor(user.role));
  return user;
};
