import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { PasswordHasher } from "../helper/passwordHasher";
import type { SessionRepository } from "../repository/sessionRepository";
import type { UserRepository } from "../repository/userRepository";

export interface User {
  username: string;
  email: string;
}

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Only the hash is stored, so a leaked sessions table can't be used to sign in. */
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export class AuthService {
  private readonly users: UserRepository;
  private readonly sessions: SessionRepository;
  private readonly passwords: PasswordHasher;
  /** Checked when the login doesn't exist, so a wrong username takes as long as a wrong password. */
  private dummyHash: Promise<string> | null = null;

  constructor(users: UserRepository, sessions: SessionRepository, passwords: PasswordHasher) {
    this.users = users;
    this.sessions = sessions;
    this.passwords = passwords;
  }

  /** Returns the user and a new session token, or null if the login or password is wrong. */
  async signIn(login: string, password: string): Promise<{ user: User; token: string } | null> {
    const record = await this.users.findByLogin(login);
    if (!record) {
      this.dummyHash ??= this.passwords.hash("not-a-real-password");
      await this.passwords.verify(password, await this.dummyHash);
      return null;
    }
    if (!(await this.passwords.verify(password, record.passwordHash))) return null;

    const token = randomBytes(32).toString("base64url");
    await this.sessions.create(hashToken(token), record.id, new Date(Date.now() + SESSION_TTL_MS));
    return { user: { username: record.username, email: record.email }, token };
  }

  async getUser(token: string): Promise<User | null> {
    return this.sessions.findUser(hashToken(token));
  }

  async signOut(token: string): Promise<void> {
    await this.sessions.delete(hashToken(token));
  }
}
