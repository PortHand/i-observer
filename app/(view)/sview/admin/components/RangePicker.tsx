import { dashboard } from "../content/adminContent";
import { DASHBOARD_RANGES, type DashboardRange } from "../services/adminService";

/** How many days the dashboard looks back over. Changing it updates the figures in place. */
export default function RangePicker({ current, onSelect }: { current: DashboardRange; onSelect: (range: DashboardRange) => void }) {
  return (
    <div className="segmented mono" role="group" aria-label={dashboard.rangeLabel}>
      {DASHBOARD_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          className="segmented__option"
          aria-pressed={range === current}
          onClick={() => onSelect(range)}
        >
          {dashboard.ranges[range]}
        </button>
      ))}
    </div>
  );
}
