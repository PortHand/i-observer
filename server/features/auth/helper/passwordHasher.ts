import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keyLength: number) => Promise<Buffer>;

const KEY_LENGTH = 64;
const PREFIX = "scrypt";

/** Hashes passwords with scrypt. Stored as "scrypt$<salt>$<hash>", both base64. */
export class PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await scryptAsync(password, salt, KEY_LENGTH);
    return [PREFIX, salt.toString("base64"), key.toString("base64")].join("$");
  }

  async verify(password: string, stored: string): Promise<boolean> {
    const [prefix, salt, hash] = stored.split("$");
    if (prefix !== PREFIX || !salt || !hash) return false;
    const expected = Buffer.from(hash, "base64");
    const actual = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length);
    return timingSafeEqual(actual, expected);
  }
}
