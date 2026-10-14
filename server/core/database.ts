import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

export type Orm = NodePgDatabase<typeof schema>;

// `next dev` re-runs modules on every edit. Keeping the client on globalThis stops each reload
// from opening a new connection pool.
const cache = globalThis as typeof globalThis & { iobserverOrm?: Orm };

export class Database {
  /** Connects on first use, so `next build` works without DATABASE_URL. */
  static get orm(): Orm {
    if (!cache.iobserverOrm) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
      cache.iobserverOrm = drizzle({ client: new Pool({ connectionString, max: 10 }), schema });
    }
    return cache.iobserverOrm;
  }
}
