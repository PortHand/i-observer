import "server-only";
import { cookies } from "next/headers";
import { isValidEmail } from "@/app/(view)/(pview)/home/helper/homeHelper";
import { form } from "@/app/(view)/(pview)/sign-in/content/signInContent";
import { isValidUsername, normalizeUsername } from "@/app/(view)/(pview)/sign-in/helper/signInHelper";
import { BaseController } from "@/server/core/baseController";
import { HttpError, type FieldErrors } from "@/server/core/httpError";
import { SESSION_TTL_MS, type AuthService } from "../service/authService";

const SESSION_COOKIE = "iob_session";

export class AuthController extends BaseController {
  private readonly service: AuthService;

  constructor(service: AuthService) {
    super();
    this.service = service;
  }

  /**
   * POST /api/auth/sign-in with JSON { username, password }. The desktop app sends { email, password }
   * instead (see SignInRequest in iobserver-app), so either works.
   */
  signIn(request: Request) {
    return this.handle(async () => {
      const body = await this.readJson(request);
      const login = normalizeUsername(String(body.username ?? body.email ?? ""));
      // Passwords are compared as typed, spaces included.
      const password = String(body.password ?? "");

      const fields: FieldErrors = {};
      if (!login) fields.username = form.errors.usernameMissing;
      else if (!isValidUsername(login) && !isValidEmail(login)) fields.username = form.errors.usernameInvalid;
      if (!password) fields.password = form.errors.passwordMissing;
      this.assertValid(fields);

      const session = await this.service.signIn(login, password);
      if (!session) throw HttpError.unauthorized("That username and password don't match.");

      (await cookies()).set(SESSION_COOKIE, session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL_MS / 1000,
      });
      return this.ok({ user: session.user });
    });
  }

  /** POST /api/auth/sign-out. */
  signOut() {
    return this.handle(async () => {
      const store = await cookies();
      const token = store.get(SESSION_COOKIE)?.value;
      if (token) await this.service.signOut(token);
      store.delete(SESSION_COOKIE);
      return this.ok({});
    });
  }

  /** GET /api/auth/session: the signed-in user, or null. */
  getSession() {
    return this.handle(async () => {
      const token = (await cookies()).get(SESSION_COOKIE)?.value;
      return this.ok({ user: token ? await this.service.getUser(token) : null });
    });
  }
}
