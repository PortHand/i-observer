"use client";

import { Check, CircleAlert, Copy, KeyRound, RotateCw, SquareTerminal } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { installCommand } from "../content/welcomeContent";
import { useCopyHandler } from "../handler/useCopyHandler";
import { fill } from "../helper/welcomeHelper";
import MacOpenShot from "./MacOpenShot";

interface InstallTerminalProps {
  platform: "mac" | "windows";
  /** This account's command, once asked for; null before. */
  command: string | null;
  expiresIn: number | null;
  expired: boolean;
  loading: boolean;
  error: string;
  onGenerate: () => void;
}

/**
 * The quick install at the top of a tab: a terminal window with this account's one-time command,
 * shown on request, and a button that copies it. On a Mac, a picture of the keychain prompt the app
 * shows when it opens, and which button to click.
 */
export default function InstallTerminal({ platform, command, expiresIn, expired, loading, error, onGenerate }: InstallTerminalProps) {
  const { copied, copy } = useCopyHandler();
  const system = installCommand[platform];
  const ready = command !== null && !expired;

  return (
    <div className="card install theme-ink">
      <div className="install__text">
        <span className="mono accent">{installCommand.label}</span>
        <h3 className="download__title">{installCommand.title}</h3>
        <p className="text-muted">{system.lead}</p>
      </div>

      <div className={`install__terminal install__terminal--${platform}`}>
        <div className="install__bar" aria-hidden="true">
          {platform === "mac" ? (
            <span className="install__lights">
              <span />
              <span />
              <span />
            </span>
          ) : (
            <SquareTerminal className="icon icon--sm" strokeWidth={1.75} />
          )}
          <span className="install__window-title">{system.windowTitle}</span>
        </div>
        <div className="install__screen">
          <span className="install__prompt" aria-hidden="true">
            {system.prompt}
          </span>
          <code className={ready ? "install__command" : "install__command install__command--placeholder"}>
            {ready ? command : installCommand.placeholder}
          </code>
        </div>
      </div>

      <div className="install__actions">
        {ready ? (
          <>
            <button type="button" className="button button--primary button--lg" onClick={() => void copy(command)} aria-live="polite">
              {copied ? <Check className="icon icon--sm" strokeWidth={1.75} /> : <Copy className="icon icon--sm" strokeWidth={1.75} />}
              {copied ? installCommand.copied : installCommand.copy}
            </button>
            <button type="button" className="button button--secondary" disabled={loading} aria-busy={loading || undefined} onClick={onGenerate}>
              {loading ? <Spinner /> : <RotateCw className="icon icon--sm" strokeWidth={1.75} />}
              {installCommand.regenerate}
            </button>
          </>
        ) : (
          <button type="button" className="button button--primary button--lg" disabled={loading} aria-busy={loading || undefined} onClick={onGenerate}>
            {loading ? <Spinner /> : <KeyRound className="icon icon--sm" strokeWidth={1.75} />}
            {loading ? installCommand.generating : command ? installCommand.regenerate : installCommand.generate}
          </button>
        )}
      </div>

      <div className="install__notes">
        {error ? (
          <p className="form-error" role="alert">
            <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
            <span>{error}</span>
          </p>
        ) : expired ? (
          <p className="download__status download__status--soon" role="status">
            {installCommand.expired}
          </p>
        ) : (
          ready &&
          expiresIn !== null && (
            <p className="hint" role="status">
              <KeyRound className="icon icon--sm" strokeWidth={1.75} />
              <span>{fill(installCommand.validity, { minutes: String(Math.round(expiresIn / 60)) })}</span>
            </p>
          )
        )}
      </div>

      {platform === "mac" && (
        <div className="install__after">
          <MacOpenShot shot="keychain" />
          <div className="stack-sm">
            <span className="section-label">{installCommand.mac.keychain.label}</span>
            <h4 className="mac-open__title">{installCommand.mac.keychain.title}</h4>
            <p className="text-muted">{installCommand.mac.keychain.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
