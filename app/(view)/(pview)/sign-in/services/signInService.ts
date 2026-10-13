// API calls for the Sign in page. There is no backend yet, so this is a placeholder that always
// declines. Replace it with the real auth API before relying on the form.

import type { SignInCredentials } from "../helper/signInHelper";

export interface User {
  username: string;
}

export type SignInResult = { ok: true; user: User } | { ok: false; error: string };

export const signIn = async ({ username, password }: SignInCredentials): Promise<SignInResult> => {
  // TODO: replace with a call to the real auth API.
  void username;
  void password;
  return { ok: false, error: "Sign-in is not available on the web yet. Use the iObserver desktop app." };
};
