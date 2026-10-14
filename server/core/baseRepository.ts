import "server-only";
import { Database } from "./database";

/** Postgres error code for a unique constraint violation. */
const UNIQUE_VIOLATION = "23505";

/** Drizzle wraps driver errors, so the Postgres error may be the cause rather than the error itself. */
const postgresError = (error: unknown): { code?: string; constraint?: string } | null => {
  for (let current = error; current instanceof Error; current = current.cause) {
    if ("code" in current) return current as { code?: string; constraint?: string };
  }
  return null;
};

/** True when `error` broke the given unique constraint, e.g. "orders_reference_unique". */
export const isUniqueViolation = (error: unknown, constraint: string) => {
  const cause = postgresError(error);
  return cause?.code === UNIQUE_VIOLATION && cause.constraint === constraint;
};

export abstract class BaseRepository {
  protected get db() {
    return Database.orm;
  }
}
