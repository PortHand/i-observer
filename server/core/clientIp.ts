import "server-only";

/**
 * The visitor's IP address, for per-address limits. On Vercel, x-forwarded-for is set by the
 * platform (a client-sent value is overwritten), so its first entry is the real client. Elsewhere,
 * only trust it behind a proxy that does the same. Without one it can be faked, so per-address
 * limits must never be the only protection: SignInLimiter also limits per username.
 */
export const clientIp = (headers: Headers): string => {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
};
