import "server-only";
import { Database } from "./database";

export abstract class BaseRepository {
  protected get db() {
    return Database.orm;
  }
}
