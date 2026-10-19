import { Clock, MonitorDown } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { download, type Installer } from "../content/welcomeContent";
import { fill } from "../helper/welcomeHelper";

export type DownloadState = "preparing" | "started" | "coming-soon" | "unknown" | "idle";

/** The line under the download card's title: what's happening with this computer's download. */
export default function DownloadStatus({ state, detected }: { state: DownloadState; detected: Installer | null }) {
  switch (state) {
    case "preparing":
      return (
        <p className="download__status" role="status">
          <Spinner />
          {download.preparing}
        </p>
      );
    case "started":
      return (
        <div className="stack-sm" role="status">
          <p className="download__status download__status--ok">
            <MonitorDown className="icon icon--sm" strokeWidth={1.75} />
            {download.started}
          </p>
          <p className="text-muted">{download.startedHint}</p>
        </div>
      );
    case "coming-soon":
      return (
        <div className="stack-sm" role="status">
          <p className="download__status download__status--soon">
            <Clock className="icon icon--sm" strokeWidth={1.75} />
            {download.comingSoon}
          </p>
          <p className="text-muted">{fill(download.comingSoonText, { os: detected?.os ?? "" })}</p>
        </div>
      );
    case "unknown":
      return <p className="text-muted">{download.unknownDevice}</p>;
    default:
      return null;
  }
}
