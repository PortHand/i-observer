// Bearer tokens for the desktop app (app/api/app): "<payload>.<signature>", both base64url, like
// the sign-in cookie in sessionToken.ts but signed with a key derived for the app alone, so an app
// token is never accepted as a website cookie and a cookie never as an app token.
//
// The payload carries a fingerprint of the account's password: changing the password ends every
// app sign-in made with the old one. It also carries the sign-in's id (sid): only the account's
// latest app sign-in (users.app_session_id) is accepted, so signing in on another computer ends this
// one. Changing SESSION_SECRET ends all of them.

import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/server/core/env";
import type { UserRow } from "@/server/features/user/repository/userRepository";

/** How long an app sign-in lasts. The app re-checks the account and its plan on every launch. */
export const APP_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const MIN_SECRET_LENGTH = 32;

interface AppTokenPayload {
  aud: "app";
  userId: string;
  /** Which app sign-in this is (AuthService.startSession). */
  sid: string;
  /** Password fingerprint when the token was issued. */
  pv: string;
  /** Milliseconds since the epoch. */
  expiresAt: number;
}

const key = (purpose: string) => {
  const value = env.sessionSecret;
  if (!value || value.length < MIN_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters. Add it to .env.development (see .env.example).`);
  }
  return `${value}:${purpose}`;
};

const sign = (data: string) => createHmac("sha256", key("app-token")).update(data).digest("base64url");

const passwordFingerprint = (user: Pick<UserRow, "id" | "password">) =>
  createHmac("sha256", key("app-token-password")).update(`${user.id}:${user.password}`).digest("base64url").slice(0, 22);

const sameText = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export const signAppToken = (user: Pick<UserRow, "id" | "password">, sid: string): { token: string; expiresAt: number } => {
  const expiresAt = Date.now() + APP_TOKEN_TTL_MS;
  const payload: AppTokenPayload = { aud: "app", userId: user.id, sid, pv: passwordFingerprint(user), expiresAt };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${data}.${sign(data)}`, expiresAt };
};

/** The token's payload when it's signed by us, meant for the app and not expired, else null. */
export const readAppToken = (token: string | undefined): AppTokenPayload | null => {
  if (!token || token.length > 1024) return null;
  const [data, signature, extra] = token.split(".");
  if (!data || !signature || extra !== undefined) return null;
  if (!sameText(sign(data), signature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as AppTokenPayload;
    // Tokens from before sid existed fail here too, so the app asks for a sign-in once more.
    if (payload.aud !== "app" || typeof payload.userId !== "string" || typeof payload.sid !== "string") return null;
    if (typeof payload.pv !== "string") return null;
    if (typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

/** True while the account's password is still the one the token was issued with. */
export const appTokenMatchesUser = (payload: AppTokenPayload, user: Pick<UserRow, "id" | "password">) =>
  payload.userId === user.id && sameText(payload.pv, passwordFingerprint(user));
