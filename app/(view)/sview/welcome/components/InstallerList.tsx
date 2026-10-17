import { Download } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { download, installers, type InstallerId } from "../content/welcomeContent";

interface InstallerListProps {
  primary: InstallerId | null;
  loading: InstallerId | null;
  onPick: (installer: InstallerId) => void;
}

/** Every installer, macOS first. Ones not released yet are listed but can't be picked. */
export default function InstallerList({ primary, loading, onPick }: InstallerListProps) {
  return (
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
              aria-busy={loading === installer.id || undefined}
              disabled={installer.comingSoon || loading !== null}
              onClick={() => onPick(installer.id)}
            >
              <span className="installer__text">
                <span className="installer__name">{installer.label}</span>
                <span className="installer__detail mono">{installer.detail}</span>
              </span>
              {installer.comingSoon ? (
                <span className="installer__soon mono">{download.comingSoon}</span>
              ) : loading === installer.id ? (
                <Spinner />
              ) : (
                <Download className="icon icon--sm" strokeWidth={1.75} />
              )}
            </button>
          </li>
        ))}
      </ul>
      <p className="hint">{download.macArchHint}</p>
    </div>
  );
}
