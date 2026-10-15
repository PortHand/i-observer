import type { CSSProperties } from "react";
import { formatAmount } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { dashboard } from "../content/adminContent";
import { formatCompactAmount, formatDay, niceScale, orderCount } from "../helper/adminHelper";
import type { DashboardDay } from "../services/adminService";

const TICKS = 4;

/** How many columns apart the day labels sit, so about six fit under the chart, even on a phone. */
const labelEvery = (days: number) => Math.max(1, Math.ceil(days / 6));

/** The tooltip text for one day. */
const tipFor = (day: DashboardDay) =>
  dashboard.trend.tip
    .replace("{orders}", orderCount(day.approved, dashboard.payments))
    .replace("{placed}", String(day.orders));

/**
 * Approved revenue per day as columns: one series, so the title names it and there's no legend.
 * Hovering a day shows its figures; the same figures are in the table below the chart.
 */
export default function TrendChart({ days, caption }: { days: DashboardDay[]; caption: string }) {
  const { trend } = dashboard;
  const peak = Math.max(...days.map((day) => day.revenue));
  // With nothing approved, an empty frame in round thousands and a note, rather than an axis of single rupees.
  const scale = niceScale(peak || 1000, TICKS);
  const ticks = Array.from({ length: TICKS + 1 }, (_, index) => index * scale.step);
  const every = labelEvery(days.length);
  // Tooltips near the edges open inwards so they stay inside the card.
  const edge = Math.max(1, Math.round(days.length * 0.15));

  return (
    <section className="card chart">
      <header className="chart__header">
        <h2 className="section-label">{trend.title}</h2>
        <p className="chart__caption text-muted">{caption}</p>
      </header>

      <div className="trend" aria-hidden="true">
        <div className="trend__axis mono">
          {ticks.map((tick) => (
            <span key={tick} style={{ bottom: `${(tick / scale.max) * 100}%` }}>
              {formatCompactAmount(tick)}
            </span>
          ))}
        </div>
        <div className="trend__plot">
          {ticks.map((tick) => (
            <span key={tick} className="trend__gridline" style={{ bottom: `${(tick / scale.max) * 100}%` }} />
          ))}
          {peak === 0 && <p className="trend__empty text-muted">{trend.empty}</p>}
          <ol className="trend__columns">
            {days.map((day, index) => {
              const last = index === days.length - 1;
              const side = index < edge ? " trend__col--start" : index >= days.length - edge ? " trend__col--end" : "";
              return (
                <li
                  key={day.day}
                  className={`trend__col${last ? " trend__col--today" : ""}${side}`}
                  style={{ "--value": `${(day.revenue / scale.max) * 100}%` } as CSSProperties}
                >
                  <span className="trend__bar" />
                  <span className="trend__tip">
                    <strong>{formatAmount(day.revenue)}</strong>
                    <span>{last ? trend.today : formatDay(day.day)}</span>
                    <span>{tipFor(day)}</span>
                  </span>
                  {(days.length - 1 - index) % every === 0 && <span className="trend__label mono">{formatDay(day.day)}</span>}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <details className="chart__table">
        <summary className="mono">{trend.viewTable}</summary>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <caption className="visually-hidden">{trend.tableCaption}</caption>
            <thead className="mono">
              <tr>
                <th scope="col">{trend.columns.day}</th>
                <th scope="col" className="admin-table__number">{trend.columns.revenue}</th>
                <th scope="col" className="admin-table__number">{trend.columns.approved}</th>
                <th scope="col" className="admin-table__number">{trend.columns.orders}</th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((day) => (
                <tr key={day.day}>
                  <th scope="row">{formatDay(day.day)}</th>
                  <td className="admin-table__number mono">{formatAmount(day.revenue)}</td>
                  <td className="admin-table__number mono">{day.approved}</td>
                  <td className="admin-table__number mono">{day.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
