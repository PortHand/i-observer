// Signs and checks the sign-in cookie: "<payload>.<signature>", both base64url, where the payload is
// { userId, role, expiresAt } as JSON and the signature an HMAC-SHA256 of it with SESSION_SECRET.
// The cookie is readable but can't be forged or extended without the secret.
//
// No "server-only" here: ../proxy/authProxy.ts imports this too, and Proxy isn't bundled as a
// Server Component. It still never reaches the browser.

import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/server/core/env";
import type { UserRole } from "@/server/features/user/schema/userSchema";

export const SESSION_COOKIE = "iov_session";

/** How long a sign-in lasts. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
  userId: string;
  role: UserRole;
  /** Milliseconds since the epoch. */
  expiresAt: number;
}

const MIN_SECRET_LENGTH = 32;

const secret = () => {
  const value = env.sessionSecret;
  if (!value || value.length < MIN_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters. Add it to .env.development (see .env.example).`);
  }
  return value;
};

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export const signSession = (payload: SessionPayload): string => {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
};

/** The payload when the token is signed by us and not expired, else null. */
export const verifySession = (token: string | undefined): SessionPayload | null => {
  if (!token) return null;
  const [data, signature, extra] = token.split(".");
  if (!data || !signature || extra !== undefined) return null;

  const expected = Buffer.from(sign(data));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (typeof payload.userId !== "string" || typeof payload.expiresAt !== "number") return null;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
};
