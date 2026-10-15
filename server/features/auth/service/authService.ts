import "server-only";
import { timingSafeEqual } from "node:crypto";
import { HttpError } from "@/server/core/httpError";
import type { UserRepository, UserRow } from "@/server/features/user/repository/userRepository";
import type { UserRole } from "@/server/features/user/schema/userSchema";

const messages = {
  // One message for both cases, so it doesn't reveal which usernames exist.
  invalid: "That username and password don't match. Check the login email and try again.",
};

/** What pages may know about the signed-in account. Never includes the password. */
export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export const toSessionUser = ({ id, username, email, role }: UserRow): SessionUser => ({ id, username, email, role });

/** Compares in constant time, so response times don't hint at how much of a password was right. */
const samePassword = (given: string, stored: string) => {
  const a = Buffer.from(given);
  const b = Buffer.from(stored);
  return a.length === b.length && timingSafeEqual(a, b);
};

export class AuthService {
  private readonly users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  /** The account for these credentials. A 401 when the username is unknown or the password wrong. */
  async verify(username: string, password: string): Promise<UserRow> {
    const user = await this.users.findByUsername(username);
    if (!user || !samePassword(password, user.password)) throw HttpError.unauthorized(messages.invalid);
    return user;
  }

  async findUser(id: string): Promise<SessionUser | null> {
    const user = await this.users.findById(id);
    return user && toSessionUser(user);
  }
}
