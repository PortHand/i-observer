import { APP_UPDATE_MESSAGE_MAX, appUpdate } from "../content/adminContent";

/** "1.2.0": three whole numbers, as in the app's package.json. */
const VERSION_PATTERN = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;

export const isVersion = (value: string) => VERSION_PATTERN.test(value);

/** Negative when `a` is older than `b`, 0 when equal, positive when newer. Both must pass isVersion. */
export const compareVersions = (a: string, b: string) => {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
};

export type AppUpdateField = "minimumVersion" | "message";

export interface AppUpdateInput {
  forceUpdate: boolean;
  minimumVersion: string;
  /** "" for the default text. */
  message: string;
}

export type AppUpdateParse = { ok: true; input: AppUpdateInput } | { ok: false; errors: Partial<Record<AppUpdateField, string>> };

/**
 * Checks the App update form. Used in the browser and again by the Server Action, so messages
 * match. `latestVersion` is the version the website hands out: a higher minimum would block every
 * user with nothing to update to.
 */
export const parseAppUpdateForm = (input: AppUpdateInput, latestVersion: string): AppUpdateParse => {
  const minimumVersion = String(input.minimumVersion ?? "").trim();
  const message = String(input.message ?? "").trim();

  const errors: Partial<Record<AppUpdateField, string>> = {};
  if (!isVersion(minimumVersion)) errors.minimumVersion = appUpdate.errors.version;
  else if (compareVersions(minimumVersion, latestVersion) > 0)
    errors.minimumVersion = appUpdate.errors.aheadOfLatest.replace("{latest}", latestVersion);
  if (message.length > APP_UPDATE_MESSAGE_MAX) errors.message = appUpdate.errors.messageLong;
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, input: { forceUpdate: input.forceUpdate === true, minimumVersion, message } };
};
