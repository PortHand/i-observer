// Next.js runs this on the server before matching requests render; it never reaches the browser.
// It must live here in the project root and be called proxy.ts (Next.js ignores it anywhere else,
// app/ included). Each feature keeps its own checks in server/features/<feature>/proxy/: call them
// below.

import type { NextRequest } from "next/server";
import { authProxy } from "@/server/features/auth/proxy/authProxy";

export function proxy(request: NextRequest) {
  return authProxy(request);
}

// Must be literal values: Next.js reads the matcher at build time, so it can't import the route
// paths. "/sview/:path*" is secureRoot in helper/route.ts: every page under app/(view)/sview.
export const config = {
  matcher: ["/sign-in", "/sview/:path*"],
};
