import Link from "next/link";
import { dashboard } from "../content/adminContent";
import { dashboardLink } from "../helper/adminHelper";
import { DASHBOARD_RANGES, type DashboardRange } from "../services/adminService";

/** How many days the dashboard looks back over. Plain links, so the range lives in the URL. */
export default function RangePicker({ current }: { current: DashboardRange }) {
  return (
    <nav className="segmented mono" aria-label={dashboard.rangeLabel}>
      {DASHBOARD_RANGES.map((range) => (
        <Link key={range} className="segmented__option" href={dashboardLink(range)} aria-current={range === current ? "page" : undefined}>
          {dashboard.ranges[range]}
        </Link>
      ))}
    </nav>
  );
}
