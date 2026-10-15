// Creates the admin account from ADMIN_* in the .env files, or updates it to match them. Safe to run
// again: change ADMIN_PASSWORD and re-run to reset the password.
//
//   npm run db:seed-admin                              (development .env files)
//   NODE_ENV=production npm run db:seed-admin          (production ones)
//
// Settings come from server/core/env.ts and the connection URL from databaseConfig.ts, the same
// ones the app uses. Node runs those .ts files directly (it strips the types), since they import
// nothing but each other.

import nextEnv from "@next/env";
import pg from "pg";
import { databaseUrl } from "../server/core/databaseConfig.ts";
import { env } from "../server/core/env.ts";

// Load the .env files before reading env: its getters read process.env when used.
nextEnv.loadEnvConfig(process.cwd(), !env.isProduction);

const admin = { ...env.admin };

if (!admin.email || !admin.password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.development (see .env.example), then run this again.");
  process.exit(1);
}
if (admin.password.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}
if (!/^[a-z0-9._@+-]{3,254}$/.test(admin.username)) {
  console.error("ADMIN_USERNAME may only use letters, numbers, dots, dashes, underscores, + and @.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl() });
await client.connect();
try {
  const { rows } = await client.query(
    `INSERT INTO users (email, phone, username, password, role)
     VALUES ($1, $2, $3, $4, 'admin')
     ON CONFLICT (username) DO UPDATE
       SET email = EXCLUDED.email, phone = EXCLUDED.phone, password = EXCLUDED.password,
           updated_at = now()
       -- Never take over a customer's account that happens to have this username.
       WHERE users.role = 'admin'
     RETURNING (xmax = 0) AS created`,
    [admin.email, admin.phone, admin.username, admin.password],
  );
  if (rows.length === 0) {
    console.error(`"${admin.username}" is a customer's username. Pick another ADMIN_USERNAME.`);
    process.exit(1);
  }
  console.log(`${rows[0].created ? "Created" : "Updated"} admin "${admin.username}". Sign in at /sign-in.`);
} catch (error) {
  if (error.code === "23505") {
    console.error(`ADMIN_EMAIL or ADMIN_PHONE is already used by another account. Pick different ones.`);
    process.exitCode = 1;
  } else throw error;
} finally {
  await client.end();
}
