// Optimistic sign-in checks from the cookie alone (no database), run by the root proxy.ts before the
// page renders: signed-out visitors can't open anything under /sview, non-admins can't open admin
// pages, and signed-in users skip the sign-in page. The pages check again against the database
// (see ../guard/authGuard.ts).

import { NextResponse, type NextRequest } from "next/server";
import { adminRoutes, homeRouteFor, isUnder, routes, secureRoot, sessionEndedParam } from "@/helper/route";
import { SESSION_COOKIE, verifySession } from "../session/sessionToken";

export function authProxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (pathname === routes.signIn) {
    // Sent here by authGuard: the cookie is signed but the database no longer accepts it, e.g. the
    // account signed in on another browser. Drop it, or this would redirect straight back home.
    if (request.nextUrl.searchParams.has(sessionEndedParam)) {
      const response = NextResponse.next();
      if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
      return response;
    }
    return session ? to(homeRouteFor(session.role)) : NextResponse.next();
  }
  if (!isUnder(pathname, [secureRoot])) return NextResponse.next();
  if (!session) {
    const response = to(routes.signIn);
    // Drop a cookie that's expired or no longer valid, e.g. after SESSION_SECRET changed.
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
    return response;
  }
  if (isUnder(pathname, adminRoutes) && session.role !== "admin") return to(homeRouteFor(session.role));
  return NextResponse.next();
}
