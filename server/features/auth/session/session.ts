// Reads and writes the sign-in cookie for Server Actions and Server Components.

import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { env } from "@/server/core/env";
import type { UserRow } from "@/server/features/user/repository/userRepository";
import { SESSION_COOKIE, SESSION_TTL_MS, signSession, verifySession, type SessionPayload } from "./sessionToken";

/**
 * Signs `user` in on this browser as sign-in `sid` (from AuthService.startSession). Only call from a
 * Server Action or Route Handler.
 */
export const createSession = async (user: Pick<UserRow, "id" | "role">, sid: string) => {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  (await cookies()).set(SESSION_COOKIE, signSession({ userId: user.id, sid, role: user.role, expiresAt }), {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
};

export const deleteSession = async () => {
  (await cookies()).delete(SESSION_COOKIE);
};

/**
 * The signed-in session, or null. Doesn't check the account still exists or that this is still its
 * current sign-in: see authGuard for that.
 */
export const readSession = async (): Promise<SessionPayload | null> => {
  // The expiry check reads the clock (Date.now), which Cache Components won't allow while it
  // prerenders or prefetches a page. Wait for the real request, so sign-in is always checked fresh.
  await connection();
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
};
