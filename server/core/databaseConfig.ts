// Builds the Postgres connection URL from the DB_* environment variables (see .env.example).
// Shared by the app (database.ts) and drizzle-kit (drizzle.config.ts), so it can't import
// "server-only" or use the "@/" path alias.

// DB_PASSWORD may be empty, for local Postgres set up without one.
const REQUIRED = ["DB_HOST", "DB_USER", "DB_NAME"] as const;

export const databaseUrl = () => {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} not set. Add ${missing.length === 1 ? "it" : "them"} to .env.development (see .env.example).`);
  }
  const { DB_HOST, DB_PORT = "5432", DB_USER, DB_PASSWORD, DB_NAME, DB_SSL } = process.env;

  // Encoded so passwords with characters such as @, : or / don't break the URL.
  const url = new URL(`postgres://${DB_HOST}:${DB_PORT}`);
  url.username = encodeURIComponent(DB_USER!);
  if (DB_PASSWORD) url.password = encodeURIComponent(DB_PASSWORD);
  url.pathname = `/${encodeURIComponent(DB_NAME!)}`;
  if (DB_SSL === "true") url.searchParams.set("sslmode", "require");
  return url.toString();
};
