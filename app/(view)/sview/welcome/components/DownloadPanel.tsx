"use client";

import Link from "next/link";
import { CircleAlert, Download, LoaderCircle, Lock, MonitorDown, RefreshCw } from "lucide-react";
import { routes } from "@/helper/route";
import { download, installers, type InstallerId } from "../content/welcomeContent";
import { formatDate } from "../../profile/helper/profileHelper";
import { formatCountdown, getInstaller } from "../helper/welcomeHelper";
import { useDownloadHandler } from "../handler/useDownloadHandler";
import type { DownloadAccess } from "../services/welcomeService";

const fill = (text: string, values: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);

/** Why the download is locked, and where to go next. */
function Locked({ access }: { access: DownloadAccess }) {
  const reason = access.reason ?? "none";
  const text = fill(download.locked[reason], { date: access.endedAt ? formatDate(access.endedAt) : "" });
  return (
    <div className="card download download--locked theme-ink animate-in animate-in--delayed">
      <span className="icon-tile" aria-hidden="true">
        <Lock className="icon" strokeWidth={1.75} />
      </span>
      <div className="stack-sm">
        <h2 className="download__title">{download.lockedTitle}</h2>
        <p className="text-muted">{text}</p>
      </div>
      <div className="download__actions">
        {reason !== "waiting" && (
          <Link href={routes.getIOverlay} className="button button--primary">
            {download.lockedCta.buy}
          </Link>
        )}
        <Link href={routes.profile} className="button button--secondary">
          {download.lockedCta.orders}
        </Link>
      </div>
    </div>
  );
}

/**
 * Starts the download for the visitor's system as soon as the page opens, through a private link
 * that works for a few minutes. Shows the countdown, a manual button and the other installers.
 */
export default function DownloadPanel({ access }: { access: DownloadAccess }) {
  const { detected, link, live, secondsLeft, loading, error, requestLink } = useDownloadHandler(access.allowed);

  if (!access.allowed) return <Locked access={access} />;

  const primary: InstallerId | null = link?.installer ?? detected ?? null;
  const primaryInstaller = primary ? getInstaller(primary) : null;
  const total = link ? link.expiresIn : 1;

  let status;
  if (detected === undefined || (loading && loading === primary)) {
    status = (
      <p className="download__status" role="status">
        <LoaderCircle className="icon icon--sm spin" strokeWidth={1.75} />
        {download.preparing}
      </p>
    );
  } else if (link && live) {
    status = (
      <div className="stack-sm" role="status">
        <p className="download__status download__status--ok">
          <MonitorDown className="icon icon--sm" strokeWidth={1.75} />
          {download.started}
        </p>
        <p className="text-muted">{download.startedHint}</p>
      </div>
    );
  } else if (link) {
    status = (
      <p className="download__status" role="status">
        <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
        {download.expired}
      </p>
    );
  } else if (!detected) {
    status = <p className="text-muted">{download.unknownDevice}</p>;
  }

  return (
    <div className="download-wrap animate-in animate-in--delayed">
      <div className="card download theme-ink">
        <header className="download__header">
          <span className="mono accent">{download.label}</span>
          <h2 className="download__title">{primaryInstaller ? primaryInstaller.label : download.title}</h2>
          {primaryInstaller && <p className="text-muted mono download__detail">{primaryInstaller.detail}</p>}
        </header>

        {status}

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
                onClick={() => requestLink(primaryInstaller.id)}
              >
                {link ? <RefreshCw className="icon icon--sm" strokeWidth={1.75} /> : <Download className="icon icon--sm" strokeWidth={1.75} />}
                {link ? download.newLink : error ? download.retry : fill(download.downloadNow, { installer: primaryInstaller.label })}
              </button>
            )}
          </div>
        )}

        {link && live && (
          <div className="download__timer">
            <span className="mono">{fill(download.expiresIn, { time: formatCountdown(secondsLeft) })}</span>
            <span className="download__meter" aria-hidden="true">
              <span style={{ width: `${Math.max(0, Math.min(100, (secondsLeft / total) * 100))}%` }} />
            </span>
          </div>
        )}
      </div>

      <div className="installers">
        <div className="stack-sm">
          <span className="section-label">{download.pickTitle}</span>
          <p className="hint">{download.pickHint}</p>
        </div>
        <ul className="installers__list">
          {installers.map((installer) => (
            <li key={installer.id}>
              <button
                type="button"
                className="installer"
                aria-current={installer.id === primary ? "true" : undefined}
                disabled={loading !== null}
                onClick={() => requestLink(installer.id)}
              >
                <span className="installer__text">
                  <span className="installer__name">{installer.label}</span>
                  <span className="installer__detail mono">{installer.detail}</span>
                </span>
                {loading === installer.id ? (
                  <LoaderCircle className="icon icon--sm spin" strokeWidth={1.75} />
                ) : (
                  <Download className="icon icon--sm" strokeWidth={1.75} />
                )}
              </button>
            </li>
          ))}
        </ul>
        <p className="hint">{download.macArchHint}</p>
      </div>
    </div>
  );
}
