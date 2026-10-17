import "server-only";
import { HttpError } from "@/server/core/httpError";
import { hasAccess } from "@/server/features/entitlement/service/entitlementService";
import type { UserRepository, UserRow } from "@/server/features/user/repository/userRepository";
import { appTokenMatchesUser, readAppToken, signAppToken } from "../session/appToken";
import type { AuthService } from "./authService";

const messages = {
  signedOut: "Your sign-in has ended. Sign in again.",
  noAccess: "Your iOverlay plan has ended. Renew it on i-overlay.com, then sign in again.",
};

/** What the desktop app may know about the signed-in account. Never includes the password. */
export interface AppAccount {
  user: { username: string; email: string; role: UserRow["role"] };
  access: { lifetime: boolean; until: string | null };
}

const toAppAccount = (user: UserRow): AppAccount => ({
  user: { username: user.username, email: user.email, role: user.role },
  access: { lifetime: user.lifetimeAccess, until: user.accessUntil?.toISOString() ?? null },
});

/** Admins can always use the app; customers while their plan runs. */
const assertCanUseApp = (user: UserRow) => {
  if (user.role !== "admin" && !hasAccess(user)) throw HttpError.forbidden(messages.noAccess);
};

/** Sign-in for the desktop app (app/api/app): bearer tokens instead of the website's cookie. */
export class AppAuthService {
  private readonly auth: AuthService;
  private readonly users: UserRepository;

  constructor(auth: AuthService, users: UserRepository) {
    this.auth = auth;
    this.users = users;
  }

  /** Checks the credentials within the same limits as the website, and issues an app token. */
  async signIn(username: string, password: string, ip: string): Promise<AppAccount & { token: string; expiresAt: string }> {
    const user = await this.auth.signIn(username, password, ip);
    assertCanUseApp(user);
    const { token, expiresAt } = signAppToken(user);
    return { ...toAppAccount(user), token, expiresAt: new Date(expiresAt).toISOString() };
  }

  /**
   * The account behind an app token, checked fresh against the database: a deleted account, a
   * changed password or an ended plan all end the app sign-in (401 or 403).
   */
  async session(token: string | undefined): Promise<AppAccount> {
    const payload = readAppToken(token);
    const user = payload && (await this.users.findById(payload.userId));
    if (!payload || !user || !appTokenMatchesUser(payload, user)) throw HttpError.unauthorized(messages.signedOut);
    assertCanUseApp(user);
    return toAppAccount(user);
  }
}
