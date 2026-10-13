// API calls for the Home page. There is no backend yet, so these are placeholders that
// mirror the desktop app's IPC contract (src/shared/ipc.ts in iobserver-app).

export interface User {
  email: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export type SignInResult = { ok: true; user: User } | { ok: false; error: string };

export const signIn = async ({ email, password }: SignInRequest): Promise<SignInResult> => {
  // TODO: replace with a call to the real auth API.
  void email;
  void password;
  return { ok: false, error: "Sign-in is not available on the web yet." };
};

export const signOut = async (): Promise<void> => {
  // TODO: replace with a call to the real auth API.
};
