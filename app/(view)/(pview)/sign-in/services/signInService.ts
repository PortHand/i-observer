// Server calls for the Sign in page. The calls are Server Actions
// (server/features/auth/action/authActions.ts), so there's no API route.

import * as authActions from "@/server/features/auth/action/authActions";
import type { SignInCredentials } from "../helper/signInHelper";

export type SignInResult = Awaited<ReturnType<typeof authActions.signIn>>;

/** Sets the sign-in cookie on success; `redirectTo` is the page for the account's role. */
export const signIn = ({ username, password }: SignInCredentials): Promise<SignInResult> =>
  authActions.signIn(username, password);
