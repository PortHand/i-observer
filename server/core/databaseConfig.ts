// Builds the Postgres connection URL from the DB_* settings in env.ts (see .env.example).
// Shared by the app (database.ts) and drizzle-kit (drizzle.config.ts), so it can't import
// "server-only" or use the "@/" path alias.

import { env } from "./env";

export const databaseUrl = () => {
  const { host, port, user, password, name, ssl } = env.db;
  // DB_PASSWORD may be empty, for local Postgres set up without one.
  const missing = Object.entries({ DB_HOST: host, DB_USER: user, DB_NAME: name })
    .filter(([, value]) => !value)
    .map(([variable]) => variable);
  if (missing.length > 0 || !host || !user || !name) {
    throw new Error(`${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} not set. Add ${missing.length === 1 ? "it" : "them"} to .env.development (see .env.example).`);
  }

  // Encoded so passwords with characters such as @, : or / don't break the URL.
  const url = new URL(`postgres://${host}:${port}`);
  url.username = encodeURIComponent(user);
  if (password) url.password = encodeURIComponent(password);
  url.pathname = `/${encodeURIComponent(name)}`;
  if (ssl) {
    // libpq's "require": encrypted, without checking the certificate against a CA. Hosted Postgres
    // such as Supabase signs with its own CA, which node-postgres's stricter "require" rejects.
    url.searchParams.set("sslmode", "require");
    url.searchParams.set("uselibpqcompat", "true");
  }
  return url.toString();
};
