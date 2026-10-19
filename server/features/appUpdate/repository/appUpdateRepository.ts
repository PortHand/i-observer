import "server-only";
import { eq } from "drizzle-orm";
import { BaseRepository } from "@/server/core/baseRepository";
import { users } from "@/server/features/user/schema/userSchema";
import { APP_UPDATE_POLICY_ID, appUpdatePolicy } from "../schema/appUpdateSchema";

export type AppUpdatePolicyRow = typeof appUpdatePolicy.$inferSelect & { updatedByUsername: string | null };
export type AppUpdatePolicyChange = Pick<typeof appUpdatePolicy.$inferInsert, "forceUpdate" | "minimumVersion" | "message" | "updatedBy">;

export class AppUpdateRepository extends BaseRepository {
  /** The policy with the username of the admin who saved it, or undefined when it was never saved. */
  async find(): Promise<AppUpdatePolicyRow | undefined> {
    const [row] = await this.db
      .select({ policy: appUpdatePolicy, updatedByUsername: users.username })
      .from(appUpdatePolicy)
      .leftJoin(users, eq(users.id, appUpdatePolicy.updatedBy))
      .where(eq(appUpdatePolicy.id, APP_UPDATE_POLICY_ID));
    return row && { ...row.policy, updatedByUsername: row.updatedByUsername };
  }

  async save(change: AppUpdatePolicyChange): Promise<void> {
    const values = { ...change, updatedAt: new Date() };
    await this.db
      .insert(appUpdatePolicy)
      .values({ id: APP_UPDATE_POLICY_ID, ...values })
      .onConflictDoUpdate({ target: appUpdatePolicy.id, set: values });
  }
}
