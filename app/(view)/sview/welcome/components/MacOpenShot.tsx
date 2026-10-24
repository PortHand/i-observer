import { ArrowRight, Folder, Hand, LockKeyhole, ShieldCheck } from "lucide-react";
import type { MacOpenShot as Shot } from "../content/welcomeContent";

/** A macOS window's title bar: the three window buttons and an optional title. */
function TitleBar({ title }: { title?: string }) {
  return (
    <div className="mac-shot__bar">
      <span className="mac-shot__lights">
        <i />
        <i />
        <i />
      </span>
      {title && <span className="mac-shot__title">{title}</span>}
    </div>
  );
}

function AppIcon({ size = 48 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="mac-shot__app-icon" src="/logo.svg" alt="" width={size} height={size} />;
}

/** A macOS alert: app icon, bold title, message and stacked buttons. `target` is the one to click. */
function Alert({ title, text, buttons, target }: { title: string; text: string; buttons: string[]; target: string }) {
  return (
    <div className="mac-shot__alert">
      <AppIcon size={40} />
      <strong>{title}</strong>
      <p>{text}</p>
      <div className="mac-shot__buttons">
        {buttons.map((label) => (
          <span key={label} className={label === target ? "mac-shot__btn mac-shot__btn--target" : "mac-shot__btn"}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Drawn stand-ins for the screens macOS shows on first launch (macOS 15 and later). Decorative:
 * each step's text says the same thing, so they're hidden from screen readers.
 */
export default function MacOpenShot({ shot }: { shot: Shot }) {
  return (
    <div className={`mac-shot mac-shot--${shot}`} aria-hidden="true">
      {shot === "install" && (
        <div className="mac-shot__window">
          <TitleBar title="iOverlay" />
          <div className="mac-shot__dmg">
            <span className="mac-shot__file">
              <AppIcon />
              iOverlay
            </span>
            <ArrowRight className="mac-shot__arrow" strokeWidth={2} />
            <span className="mac-shot__file mac-shot__file--target">
              <Folder className="mac-shot__folder" strokeWidth={1.5} />
              Applications
            </span>
          </div>
        </div>
      )}

      {shot === "blocked" && (
        <Alert
          title={'"iOverlay" Not Opened'}
          text={'Apple could not verify "iOverlay" is free of malware that may harm your Mac or compromise your privacy.'}
          buttons={["Done", "Move to Bin"]}
          target="Done"
        />
      )}

      {shot === "settings" && (
        <div className="mac-shot__window mac-shot__settings">
          <TitleBar />
          <div className="mac-shot__split">
            <ul className="mac-shot__sidebar">
              <li>General</li>
              <li>Appearance</li>
              <li className="mac-shot__selected">
                <Hand className="mac-shot__side-icon" strokeWidth={2} />
                Privacy &amp; Security
              </li>
              <li>Desktop &amp; Dock</li>
            </ul>
            <div className="mac-shot__pane">
              <span className="mac-shot__pane-title">Privacy &amp; Security</span>
              <span className="mac-shot__group-label">
                <ShieldCheck className="mac-shot__side-icon" strokeWidth={2} />
                Security
              </span>
              <div className="mac-shot__row">
                <span>{'"iOverlay" was blocked to protect your Mac.'}</span>
                <span className="mac-shot__btn mac-shot__btn--target">Open Anyway</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {shot === "confirm" && (
        <Alert
          title={'Open "iOverlay"?'}
          text="Only open it if you trust its source. You won't be asked again."
          buttons={["Open Anyway", "Move to Bin"]}
          target="Open Anyway"
        />
      )}

      {shot === "keychain" && (
        <div className="mac-shot__alert mac-shot__keychain">
          <LockKeyhole className="mac-shot__lock" strokeWidth={1.75} />
          <strong>{'iOverlay wants to use "iOverlay Safe Storage" in your keychain.'}</strong>
          <span className="mac-shot__password">••••••••</span>
          <div className="mac-shot__buttons mac-shot__buttons--row">
            <span className="mac-shot__btn mac-shot__btn--target">Always Allow</span>
            <span className="mac-shot__btn">Deny</span>
            <span className="mac-shot__btn mac-shot__btn--default">Allow</span>
          </div>
        </div>
      )}
    </div>
  );
}
