import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import { databaseUrl } from "./databaseConfig";

export type Orm = NodePgDatabase<typeof schema>;

// `next dev` re-runs modules on every edit. Keeping the client on globalThis stops each reload
// from opening a new connection pool.
const cache = globalThis as typeof globalThis & { iobserverOrm?: Orm };

export class Database {
  /** Connects on first use, so `next build` works without the DB_* settings. */
  static get orm(): Orm {
    if (!cache.iobserverOrm) {
      cache.iobserverOrm = drizzle({ client: new Pool({ connectionString: databaseUrl(), max: 10 }), schema });
    }
    return cache.iobserverOrm;
  }
}
