import { form } from "../content/signInContent";

export type SignInField = "username" | "password";

export interface SignInCredentials {
  /** Lower-cased: usernames are case-insensitive. */
  username: string;
  password: string;
}

/** Letters, digits, dot, dash and underscore; 3–32 characters. */
const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;

export const normalizeUsername = (username: string) => username.trim().toLowerCase();

export const isValidUsername = (username: string) => USERNAME_PATTERN.test(normalizeUsername(username));

/** Reads and checks the form. Returns the credentials, or an error per invalid field. */
export const parseSignInForm = (
  data: FormData,
): { ok: true; credentials: SignInCredentials } | { ok: false; errors: Partial<Record<SignInField, string>> } => {
  const username = normalizeUsername(String(data.get("username") ?? ""));
  // Passwords are compared as typed, spaces included.
  const password = String(data.get("password") ?? "");
  const { errors: text } = form;

  const errors: Partial<Record<SignInField, string>> = {};
  if (!username) errors.username = text.usernameMissing;
  else if (!isValidUsername(username)) errors.username = text.usernameInvalid;
  if (!password) errors.password = text.passwordMissing;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, credentials: { username, password } };
};
