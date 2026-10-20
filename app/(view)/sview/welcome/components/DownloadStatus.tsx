import { MonitorDown } from "lucide-react";
import Spinner from "@/components/common/Spinner";
import { download } from "../content/welcomeContent";

export type DownloadState = "preparing" | "started";

/** The line under the download bar's title while a download is being prepared, or once it started. */
export default function DownloadStatus({ state }: { state: DownloadState }) {
  if (state === "preparing") {
    return (
      <p className="download__status" role="status">
        <Spinner />
        {download.preparing}
      </p>
    );
  }
  return (
    <div className="stack-sm" role="status">
      <p className="download__status download__status--ok">
        <MonitorDown className="icon icon--sm" strokeWidth={1.75} />
        {download.started}
      </p>
      <p className="text-muted">{download.startedHint}</p>
    </div>
  );
}
