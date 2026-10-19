import "server-only";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { compareVersions, isVersion, type AppUpdateInput } from "@/app/(view)/sview/admin/helper/appUpdateHelper";
import type { AppUpdatePolicyView } from "@/app/(view)/sview/admin/services/adminService";
import { routes } from "@/helper/route";
import type { AppUpdateRepository } from "../repository/appUpdateRepository";

/** GET /api/app/update's answer for one installed version. */
export interface AppUpdateCheck {
  /** True when this version may not be used until the user updates. */
  required: boolean;
  /** Oldest version allowed; null while force update is off. */
  minimumVersion: string | null;
  /** The version the website hands out (its installers). */
  latestVersion: string;
  /** The admin's message for the update screen, or null for the app's default text. */
  message: string | null;
  /** Website page where signed-in users download the installer. */
  downloadPath: string;
}

/** The desktop app's forced-update policy, set from the admin portal and read by the app. */
export class AppUpdateService {
  private readonly policies: AppUpdateRepository;

  constructor(policies: AppUpdateRepository) {
    this.policies = policies;
  }

  /** The saved policy, or force update off when it was never saved. */
  async policy(): Promise<AppUpdatePolicyView> {
    const row = await this.policies.find();
    if (!row) return { forceUpdate: false, minimumVersion: appInfo.version, message: null, updatedAt: null, updatedBy: null };
    return {
      forceUpdate: row.forceUpdate,
      minimumVersion: row.minimumVersion,
      message: row.message,
      updatedAt: row.updatedAt.toISOString(),
      updatedBy: row.updatedByUsername,
    };
  }

  /** Saves the policy. `input` must have passed parseAppUpdateForm. */
  save(input: AppUpdateInput, adminId: string): Promise<void> {
    return this.policies.save({
      forceUpdate: input.forceUpdate,
      minimumVersion: input.minimumVersion,
      message: input.message || null,
      updatedBy: adminId,
    });
  }

  /**
   * Whether `version` must update under `policy`. A version that can't be read is let through: it
   * would be an app bug, and blocking on it could lock out every user with no way to recover.
   */
  static check(policy: AppUpdatePolicyView, version: string): AppUpdateCheck {
    const enforced = policy.forceUpdate && isVersion(policy.minimumVersion);
    return {
      required: enforced && isVersion(version) && compareVersions(version, policy.minimumVersion) < 0,
      minimumVersion: enforced ? policy.minimumVersion : null,
      latestVersion: appInfo.version,
      message: policy.message,
      downloadPath: routes.welcome,
    };
  }
}
