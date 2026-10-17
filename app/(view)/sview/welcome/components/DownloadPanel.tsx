"use client";

import { CircleAlert, Download, RefreshCw } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { download, type InstallerId } from "../content/welcomeContent";
import { fill, formatCountdown, getInstaller, isAvailableInstaller } from "../helper/welcomeHelper";
import { useDownloadHandler } from "../handler/useDownloadHandler";
import type { DownloadAccess } from "../services/welcomeService";
import DownloadLocked from "./DownloadLocked";
import DownloadStatus, { type DownloadState } from "./DownloadStatus";
import InstallerList from "./InstallerList";

/** Time left on the private link, as text and a draining bar. */
function LinkTimer({ secondsLeft, total }: { secondsLeft: number; total: number }) {
  return (
    <div className="download__timer">
      <span className="mono">{fill(download.expiresIn, { time: formatCountdown(secondsLeft) })}</span>
      <span className="download__meter" aria-hidden="true">
        <span style={{ width: `${Math.max(0, Math.min(100, (secondsLeft / total) * 100))}%` }} />
      </span>
    </div>
  );
}

/**
 * Starts the download for the visitor's system as soon as the page opens, through a private link
 * that works for a few minutes. Shows the countdown, a manual button and the other installers.
 * Windows and Linux are coming soon: those visitors get a note instead of a download.
 */
export default function DownloadPanel({ access }: { access: DownloadAccess }) {
  const { detected, link, live, secondsLeft, loading, error, requestLink } = useDownloadHandler(access.allowed);

  if (!access.allowed) return <DownloadLocked access={access} />;

  const detectedSoon = detected ? !isAvailableInstaller(detected) : false;
  const primary: InstallerId | null = link?.installer ?? (detected && !detectedSoon ? detected : null);
  const primaryInstaller = primary ? getInstaller(primary) : null;
  const detectedInstaller = detected ? getInstaller(detected) : null;

  let state: DownloadState = "idle";
  if (detected === undefined || (loading !== null && loading === primary)) state = "preparing";
  else if (link && live) state = "started";
  else if (link) state = "expired";
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
            {link && live && link.installer === primary ? (
              <a href={link.url} className="button button--primary button--lg" rel="noopener">
                <Download className="icon icon--sm" strokeWidth={1.75} />
                {fill(download.downloadNow, { installer: primaryInstaller.label })}
              </a>
            ) : (
              <button
                type="button"
                className="button button--primary button--lg"
                disabled={loading !== null}
                aria-busy={loading === primaryInstaller.id || undefined}
                onClick={() => requestLink(primaryInstaller.id)}
              >
                {loading === primaryInstaller.id ? (
                  <Spinner />
                ) : link ? (
                  <RefreshCw className="icon icon--sm" strokeWidth={1.75} />
                ) : (
                  <Download className="icon icon--sm" strokeWidth={1.75} />
                )}
                {link ? download.newLink : error ? download.retry : fill(download.downloadNow, { installer: primaryInstaller.label })}
              </button>
            )}
          </div>
        )}

        {link && live && <LinkTimer secondsLeft={secondsLeft} total={link.expiresIn} />}
      </div>

      <InstallerList primary={primary} loading={loading} onPick={requestLink} />
    </div>
  );
}
