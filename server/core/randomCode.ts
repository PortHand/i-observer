import { randomInt } from "node:crypto";

// No 0/O or 1/I, so codes read back over the phone are unambiguous.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Random code such as "AB12CD", used in order references and support tickets. */
export const randomCode = (length: number) =>
  Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

/** Calls `create` with fresh codes until one doesn't collide, for codes with a unique constraint. */
export const withUniqueCode = async <T>(
  makeCode: () => string,
  create: (code: string) => Promise<T | null>,
  attempts = 5,
): Promise<T> => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const result = await create(makeCode());
    if (result !== null) return result;
  }
  throw new Error(`Couldn't generate a unique code after ${attempts} attempts.`);
};
