import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import { databaseUrl } from "./databaseConfig";
import { env } from "./env";

export type Orm = NodePgDatabase<typeof schema>;

/** An open transaction. Repository methods that take one run inside it; see Database.transaction. */
export type Tx = Parameters<Parameters<Orm["transaction"]>[0]>[0];

// `next dev` re-runs modules on every edit. Keeping the client on globalThis stops each reload
// from opening a new connection pool.
const cache = globalThis as typeof globalThis & { ioverlayOrm?: Orm };

export class Database {
  /** Connects on first use, so `next build` works without the DB_* settings. */
  static get orm(): Orm {
    if (!cache.ioverlayOrm) {
      const pool = new Pool({
        connectionString: databaseUrl(),
        max: env.db.poolMax,
        // Hand idle connections back quickly, so frozen serverless instances don't hold pooler slots.
        idleTimeoutMillis: 10_000,
        // When every connection is busy, fail after a while instead of hanging the request.
        connectionTimeoutMillis: 10_000,
      });
      cache.ioverlayOrm = drizzle({ client: pool, schema });
    }
    return cache.ioverlayOrm;
  }

  /** Runs `work` in one transaction: everything it writes is saved together, or nothing is. */
  static transaction<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
    return Database.orm.transaction(work);
  }
}
