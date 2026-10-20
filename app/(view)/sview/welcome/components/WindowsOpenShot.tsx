import { FileDown, Folder, Minus, Square, X } from "lucide-react";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import type { WindowsOpenShot as Shot } from "../content/welcomeContent";
import { installerFileName } from "../helper/welcomeHelper";

/** The setup file this release downloads, e.g. "overlay-1.0.1-setup.exe". */
const setupFile = installerFileName("windows", appInfo.version);

/** A Windows 11 window's title bar: an optional title, then minimize, maximize and close. */
function TitleBar({ title }: { title?: string }) {
  return (
    <div className="win-shot__bar">
      <span className="win-shot__title">{title}</span>
      <span className="win-shot__controls">
        <Minus strokeWidth={1.5} />
        <Square strokeWidth={1.5} />
        <X strokeWidth={1.5} />
      </span>
    </div>
  );
}

/** Microsoft Defender SmartScreen's warning; `expanded` is after More info, with Run anyway. */
function SmartScreen({ expanded }: { expanded: boolean }) {
  return (
    <div className="win-shot__smartscreen">
      <X className="win-shot__close" strokeWidth={1.5} />
      <strong>Windows protected your PC</strong>
      <p>Microsoft Defender SmartScreen prevented an unrecognized app from starting. Running this app might put your PC at risk.</p>
      {expanded ? (
        <p className="win-shot__facts">
          App: {setupFile}
          <br />
          Publisher: Unknown publisher
        </p>
      ) : (
        <span className="win-shot__link win-shot__target">More info</span>
      )}
      <div className="win-shot__actions">
        {expanded && <span className="win-shot__btn win-shot__target">Run anyway</span>}
        <span className="win-shot__btn">Don&apos;t run</span>
      </div>
    </div>
  );
}

/**
 * Drawn stand-ins for the screens Windows shows when installing (Windows 11 look). Decorative:
 * each step's text says the same thing, so they're hidden from screen readers.
 */
export default function WindowsOpenShot({ shot }: { shot: Shot }) {
  return (
    <div className={`win-shot win-shot--${shot}`} aria-hidden="true">
      {shot === "run" && (
        <div className="win-shot__window">
          <TitleBar title="Downloads" />
          <div className="win-shot__explorer">
            <span className="win-shot__group">Today</span>
            <span className="win-shot__file win-shot__target">
              <FileDown className="win-shot__file-icon" strokeWidth={1.5} />
              {setupFile}
            </span>
            <span className="win-shot__file win-shot__file--muted">
              <Folder className="win-shot__file-icon win-shot__folder" strokeWidth={1.5} />
              Documents
            </span>
          </div>
        </div>
      )}

      {shot === "protected" && <SmartScreen expanded={false} />}

      {shot === "run-anyway" && <SmartScreen expanded />}

      {shot === "install" && (
        <div className="win-shot__window">
          <TitleBar title="iOverlay Setup" />
          <div className="win-shot__setup">
            <strong>Choose Install Location</strong>
            <p>Setup will install iOverlay in the following folder.</p>
            <span className="win-shot__field">C:\Users\you\AppData\Local\Programs\iOverlay</span>
            <div className="win-shot__actions">
              <span className="win-shot__btn">&lt; Back</span>
              <span className="win-shot__btn win-shot__btn--primary win-shot__target">Install</span>
              <span className="win-shot__btn">Cancel</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
