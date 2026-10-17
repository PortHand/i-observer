import Link from "next/link";
import { Lock } from "lucide-react";
import { routes } from "@/helper/route";
import { formatDate } from "../../profile/helper/profileHelper";
import { download } from "../content/welcomeContent";
import { fill } from "../helper/welcomeHelper";
import type { DownloadAccess } from "../services/welcomeService";

/** Why the download is locked, and where to go next. */
export default function DownloadLocked({ access }: { access: DownloadAccess }) {
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
