"use client";

import { CircleAlert, Download, RotateCw, ShieldAlert } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { download, macOpen, type InstallerId } from "../content/welcomeContent";
import { fill, getInstaller, isAvailableInstaller } from "../helper/welcomeHelper";
import { useDownloadHandler } from "../handler/useDownloadHandler";
import type { DownloadAccess } from "../services/welcomeService";
import DownloadLocked from "./DownloadLocked";
import DownloadStatus, { type DownloadState } from "./DownloadStatus";
import InstallerList from "./InstallerList";

/**
 * The download for the visitor's system, and the other installers. Each click fetches a fresh
 * private link that works for a minute and starts the download with it. Windows and Linux are
 * coming soon: those visitors get a note instead of a download.
 */
export default function DownloadPanel({ access }: { access: DownloadAccess }) {
  const { detected, started, loading, error, startInstaller } = useDownloadHandler();

  if (!access.allowed) return <DownloadLocked access={access} />;

  const detectedSoon = detected ? !isAvailableInstaller(detected) : false;
  const primary: InstallerId | null = started ?? (detected && !detectedSoon ? detected : null);
  const primaryInstaller = primary ? getInstaller(primary) : null;
  const detectedInstaller = detected ? getInstaller(detected) : null;

  let state: DownloadState = "idle";
  if (loading !== null && loading === primary) state = "preparing";
  else if (started) state = "started";
  else if (detectedSoon) state = "coming-soon";
  else if (!detected) state = "unknown";

  const title = primaryInstaller
    ? primaryInstaller.label
    : detectedSoon && detectedInstaller
      ? fill(download.comingSoonTitle, { os: detectedInstaller.os })
      : download.title;

  return (
    <div className="download-wrap animate-in animate-in--delayed">
      <div className="card download theme-ink">
        <header className="download__header">
          <span className="mono accent">{download.label}</span>
          <h2 className="download__title">{title}</h2>
          {primaryInstaller && <p className="text-muted mono download__detail">{primaryInstaller.detail}</p>}
        </header>

        <DownloadStatus state={state} detected={detectedInstaller} />

        {error && (
          <p className="form-error" role="alert">
            <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
            <span>{error}</span>
          </p>
        )}

        {primaryInstaller && (
          <div className="download__actions">
            <button
              type="button"
              className="button button--primary button--lg"
              disabled={loading !== null}
              aria-busy={loading === primaryInstaller.id || undefined}
              onClick={() => void startInstaller(primaryInstaller.id)}
            >
              {loading === primaryInstaller.id ? (
                <Spinner />
              ) : started === primaryInstaller.id ? (
                <RotateCw className="icon icon--sm" strokeWidth={1.75} />
              ) : (
                <Download className="icon icon--sm" strokeWidth={1.75} />
              )}
              {error
                ? download.retry
                : started === primaryInstaller.id
                  ? download.downloadAgain
                  : fill(download.downloadNow, { installer: primaryInstaller.label })}
            </button>
          </div>
        )}

        {primaryInstaller?.os === "macOS" && (
          <p className="hint">
            <ShieldAlert className="icon icon--sm" strokeWidth={1.75} />
            <span>
              {macOpen.hint} <a href={`#${macOpen.id}`}>{macOpen.hintLink}</a>
            </span>
          </p>
        )}
      </div>

      <InstallerList primary={primary} loading={loading} onPick={(installer) => void startInstaller(installer)} />
    </div>
  );
}
