import "server-only";
import { BaseRepository } from "@/server/core/baseRepository";
import { contactMessages } from "../schema/contactSchema";

export type NewContactMessage = Omit<typeof contactMessages.$inferInsert, "id" | "createdAt">;

export class ContactRepository extends BaseRepository {
  /** Returns the ticket, or null if it is already taken so the caller can retry with another. */
  async create(message: NewContactMessage): Promise<string | null> {
    const [row] = await this.db
      .insert(contactMessages)
      .values(message)
      .onConflictDoNothing({ target: contactMessages.ticket })
      .returning({ ticket: contactMessages.ticket });
    return row?.ticket ?? null;
  }
}
