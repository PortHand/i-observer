// drizzle-kit settings for the npm db:* scripts. Migrations are SQL files in server/db/migrations,
// applied in order and recorded in the __drizzle_migrations table, as Flyway does with its history table.

import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { databaseUrl } from "./server/core/databaseConfig";

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
