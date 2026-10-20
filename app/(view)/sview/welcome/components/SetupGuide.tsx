"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { CircleAlert, Clock, Download, RotateCw, ShieldAlert, TriangleAlert } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { download, macOpen, setupGuide, windowsOpen, type FirstOpenFix, type InstallerId } from "../content/welcomeContent";
import { fill, getInstaller } from "../helper/welcomeHelper";
import { useDownloadHandler } from "../handler/useDownloadHandler";
import type { DownloadAccess } from "../services/welcomeService";
import DownloadLocked from "./DownloadLocked";
import DownloadStatus from "./DownloadStatus";
import MacOpenShot from "./MacOpenShot";
import WindowsOpenShot from "./WindowsOpenShot";

type Platform = "mac" | "windows" | "linux";
type ReleasedPlatform = Exclude<Platform, "linux">;

interface PlatformGuide {
  id: string;
  tab: string;
  tabDetail: string;
  hint: string;
  steps: { key: string; title: string; text: string; picture: ReactNode }[];
  fix: FirstOpenFix;
}

const guides: Record<ReleasedPlatform, PlatformGuide> = {
  mac: {
    ...macOpen,
    steps: macOpen.steps.map((step) => ({ ...step, key: step.shot, picture: <MacOpenShot shot={step.shot} /> })),
  },
  windows: {
    ...windowsOpen,
    steps: windowsOpen.steps.map((step) => ({ ...step, key: step.shot, picture: <WindowsOpenShot shot={step.shot} /> })),
  },
};

const tabs: Record<Platform, { id: string; tab: string; tabDetail: string }> = {
  ...guides,
  linux: { id: "open-on-linux", ...setupGuide.linux },
};

const order: Platform[] = ["mac", "windows", "linux"];

/** The tab a "#open-on-…" link asks for, or null. */
const platformForHash = (hash: string) => order.find((platform) => `#${tabs[platform].id}` === hash) ?? null;

const platformOf = (installer: InstallerId | null | undefined): Platform | null =>
  installer ? (installer === "windows" ? "windows" : installer === "linux" ? "linux" : "mac") : null;

// The address's #fragment as a store, so links to "#open-on-windows" switch tabs (server: none).
const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => window.location.hash;
const noHash = () => "";

/**
 * The top of the welcome page: pick a computer (the visitor's own is preselected), follow its
 * one-time install steps, each with a picture of the screen, then download its installer from the
 * bar below them. "#open-on-mac" and "#open-on-windows" links open that tab. Locked accounts see the
 * steps, with why the download is locked in place of the bar.
 */
export default function SetupGuide({ access }: { access: DownloadAccess }) {
  const { detected, started, loading, error, startInstaller } = useDownloadHandler();
  const hash = useSyncExternalStore(subscribeHash, readHash, noHash);
  const [chosen, setChosen] = useState<Platform | null>(null);
  const [chosenMac, setChosenMac] = useState<InstallerId | null>(null);
  const tabRefs = useRef<Partial<Record<Platform, HTMLButtonElement | null>>>({});

  // A picked tab sets the hash too, so the latest of a click and a followed link wins.
  const active = platformForHash(hash) ?? chosen ?? platformOf(detected) ?? "mac";
  const macInstaller = chosenMac ?? (detected === "mac-x64" ? "mac-x64" : "mac-arm64");

  const select = (platform: Platform, focus = false) => {
    window.history.replaceState(window.history.state, "", `#${tabs[platform].id}`);
    setChosen(platform);
    if (focus) tabRefs.current[platform]?.focus();
  };

  /** Arrow keys, Home and End move between the tabs, as in any tab list. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = order.indexOf(active);
    const next = {
      ArrowRight: order[(index + 1) % order.length],
      ArrowLeft: order[(index - 1 + order.length) % order.length],
      Home: order[0],
      End: order[order.length - 1],
    }[event.key];
    if (!next) return;
    event.preventDefault();
    select(next, true);
  };

  return (
    <div className="setup animate-in animate-in--delayed">
      {/* What "#open-on-…" links scroll to. Not the tabs: a focused tab would show its focus ring on load. */}
      {order.map((platform) => (
        <span key={platform} id={tabs[platform].id} className="setup__anchor" aria-hidden="true" />
      ))}
      {detected === null && <p className="hint">{download.unknownDevice}</p>}

      <div className="setup__tabs" role="tablist" aria-label={setupGuide.tabsLabel} onKeyDown={onKeyDown}>
        {order.map((platform) => {
          const tab = tabs[platform];
          const selected = platform === active;
          return (
            <button
              key={platform}
              ref={(element) => {
                tabRefs.current[platform] = element;
              }}
              id={`${tab.id}-tab`}
              type="button"
              role="tab"
              className="setup__tab"
              aria-selected={selected}
              aria-controls={`${tab.id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(platform)}
            >
              <span className="setup__tab-name">{tab.tab}</span>
              <span className="setup__tab-detail mono">{tab.tabDetail}</span>
            </button>
          );
        })}
      </div>

      {order.map((platform) => (
        <div
          key={platform}
          id={`${tabs[platform].id}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabs[platform].id}-tab`}
          className="setup__panel"
          hidden={platform !== active}
        >
          {platform === "linux" ? (
            <div className="setup__soon">
              <p className="download__status download__status--soon">
                <Clock className="icon icon--sm" strokeWidth={1.75} />
                {fill(download.comingSoonTitle, { os: setupGuide.linux.tab })}
              </p>
              <p className="text-muted">{fill(download.comingSoonText, { os: setupGuide.linux.tab })}</p>
            </div>
          ) : (
            <>
              <Steps guide={guides[platform]} />
              {access.allowed ? (
                <DownloadBar
                  installer={platform === "mac" ? macInstaller : "windows"}
                  hint={guides[platform].hint}
                  onPickMac={platform === "mac" ? setChosenMac : undefined}
                  started={started}
                  loading={loading}
                  error={error}
                  onDownload={(installer) => void startInstaller(installer)}
                />
              ) : (
                <DownloadLocked access={access} />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/** One system's steps, each with a picture of the screen, then what to do if one goes differently. */
function Steps({ guide }: { guide: PlatformGuide }) {
  return (
    <>
      <ol className="mac-open">
        {guide.steps.map((step, index) => (
          <li key={step.key} className="mac-open__step">
            {step.picture}
            <div className="stack-sm">
              <span className="section-label">{fill(setupGuide.stepLabel, { n: String(index + 1) })}</span>
              <h3 className="mac-open__title">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mac-open__damaged">
        <span className="section-label">
          <TriangleAlert className="icon icon--sm" strokeWidth={1.75} />
          {guide.fix.title}
        </span>
        <p className="text-muted">{guide.fix.text}</p>
        {guide.fix.command && <code className="mac-open__command">{guide.fix.command}</code>}
        {guide.fix.items && (
          <ul className="setup__fix-list text-muted">
            {guide.fix.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

interface DownloadBarProps {
  installer: InstallerId;
  hint: string;
  /** Macs only: switches between the Apple Silicon and Intel installers. */
  onPickMac?: (installer: InstallerId) => void;
  started: InstallerId | null;
  loading: InstallerId | null;
  error: string;
  onDownload: (installer: InstallerId) => void;
}

/**
 * The download under the steps. Each click fetches a fresh private link that works for a minute
 * and starts the download with it.
 */
function DownloadBar({ installer, hint, onPickMac, started, loading, error, onDownload }: DownloadBarProps) {
  const { label, detail } = getInstaller(installer);
  const busy = loading === installer;
  const done = started === installer;

  return (
    <div className="card download setup__download theme-ink">
      <div className="setup__download-text">
        <span className="mono accent">{download.label}</span>
        <h3 className="download__title">{fill(download.title, { installer: label })}</h3>
        <p className="text-muted mono download__detail">{detail}</p>
        {busy ? (
          <DownloadStatus state="preparing" />
        ) : done ? (
          <DownloadStatus state="started" />
        ) : (
          <p className="text-muted">{download.lead}</p>
        )}
        {error && (
          <p className="form-error" role="alert">
            <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
            <span>{error}</span>
          </p>
        )}
      </div>

      <div className="setup__download-actions">
        {onPickMac && (
          <fieldset className="setup__arch">
            <legend className="section-label">{download.macArchLabel}</legend>
            {download.macArch.map((option) => (
              <label key={option.id} className="setup__arch-option">
                <input
                  type="radio"
                  name="mac-arch"
                  value={option.id}
                  checked={installer === option.id}
                  disabled={loading !== null}
                  onChange={() => onPickMac(option.id)}
                />
                <span className="setup__arch-name">{option.label}</span>
                <span className="setup__arch-detail mono">{option.detail}</span>
              </label>
            ))}
          </fieldset>
        )}

        <button
          type="button"
          className="button button--primary button--lg"
          disabled={loading !== null}
          aria-busy={busy || undefined}
          onClick={() => onDownload(installer)}
        >
          {busy ? (
            <Spinner />
          ) : done ? (
            <RotateCw className="icon icon--sm" strokeWidth={1.75} />
          ) : (
            <Download className="icon icon--sm" strokeWidth={1.75} />
          )}
          {error ? download.retry : done ? download.downloadAgain : download.downloadNow}
        </button>

        <p className="hint">
          <ShieldAlert className="icon icon--sm" strokeWidth={1.75} />
          <span>{hint}</span>
        </p>
        {onPickMac && <p className="hint">{download.macArchHint}</p>}
      </div>
    </div>
  );
}
