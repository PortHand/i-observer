import "server-only";
import { Database, type Tx } from "./database";

export abstract class BaseRepository {
  protected get db() {
    return Database.orm;
  }

  /** For methods that can join a transaction: the open one when passed, else the shared pool. */
  protected using(tx?: Tx) {
    return tx ?? Database.orm;
  }
}
