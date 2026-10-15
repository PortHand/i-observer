import "server-only";
import { desc, eq } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { feedback } from "../schema/feedbackSchema";

export type FeedbackRow = typeof feedback.$inferSelect;
export type NewFeedback = Omit<typeof feedback.$inferInsert, "id" | "createdAt">;

export class FeedbackRepository extends BaseRepository {
  async create(row: NewFeedback): Promise<FeedbackRow> {
    const [created] = await this.db.insert(feedback).values(row).returning();
    return created;
  }

  /** One customer's feedback, newest first. */
  listForUser(userId: string, limit: number): Promise<FeedbackRow[]> {
    return this.db.select().from(feedback).where(eq(feedback.userId, userId)).orderBy(desc(feedback.createdAt)).limit(limit);
  }
}
