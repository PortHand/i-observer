// drizzle-kit settings for the npm db:* scripts. Migrations are SQL files in server/db/migrations,
// applied in order and recorded in the __drizzle_migrations table, as Flyway does with its history table.

import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Same .env files `next dev` reads, so DATABASE_URL only needs setting once.
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});
