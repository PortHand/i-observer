// drizzle-kit settings for the npm db:* scripts. Migrations are SQL files in server/db/migrations,
// applied in order and recorded in the __drizzle_migrations table, as Flyway does with its history table.

import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { databaseUrl } from "./server/core/databaseConfig";

// drizzle-kit loads .env itself (with dotenv) before reading this file, and @next/env never
// overrides variables that are already set, so .env would beat .env.development here while
// `next dev` does the opposite. Drop what dotenv injected (values still equal to .env's) so the
// order below matches the app. Variables set in the shell keep winning, as they do in Next.js.
if (existsSync(".env")) {
  for (const [name, value] of Object.entries(parseEnv(readFileSync(".env", "utf8")))) {
    if (process.env[name] === value) delete process.env[name];
  }
}

// Same .env files `next dev` reads (.env.development, .env.local, .env), so the DB_* settings only
// need setting once. Run with NODE_ENV=production to read the production files instead.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dbCredentials: { url: databaseUrl() },
  strict: true,
  verbose: true,
});
