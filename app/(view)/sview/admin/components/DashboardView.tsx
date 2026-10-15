"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatAmount } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { dashboard } from "../content/adminContent";
import { useDashboardHandler } from "../handler/useDashboardHandler";
import { change, formatAge, formatDay, formatDuration, formatIst, formatIstTime, formatPercent, orderCount, ordersLink } from "../helper/adminHelper";
import type { AdminDashboard, Period } from "../services/adminService";
import { ChartSkeleton, KpiSkeleton, MetricStripSkeleton } from "./DashboardSkeleton";
import MetricStrip from "./MetricStrip";
import OrderPanel from "./OrderPanel";
import RangePicker from "./RangePicker";
import StatTile from "./StatTile";
import StatusMix from "./StatusMix";
import TrendChart from "./TrendChart";

/**
 * The admin dashboard: what's waiting, headline figures for the chosen period, the daily trend and
 * order mix, review performance, then the review queue and recent decisions. Starts from the
 * server's figures; changing the period updates them in place (see useDashboardHandler), with
 * skeletons on the parts that depend on it while they load.
 */
export default function DashboardView({ initial }: { initial: AdminDashboard }) {
  const { range, data, error, pending, selectRange } = useDashboardHandler(initial);
  const now = Date.parse(data.asOf);
  const { hero, tiles, trend, performance } = dashboard;
  const rangeText = dashboard.ranges[data.range];
  const toReview = data.counts.submitted;
  const { approved, rejected, avgSeconds } = data.decisions;

  const delta = ({ current, previous }: Period) => ({
    change: change(current, previous),
    versus: dashboard.versus.replace("{range}", rangeText),
    none: dashboard.noPrevious.replace("{range}", rangeText),
  });

  // The figures that depend on the period, each swapped for its skeleton while a new period loads.
  const periodTiles = pending ? (
    <>
      <KpiSkeleton />
      <KpiSkeleton />
      <KpiSkeleton />
    </>
  ) : (
    <>
      <StatTile
        label={tiles.revenue.label}
        value={formatAmount(data.revenue.current)}
        delta={delta(data.revenue)}
        trend={data.daily.map((day) => ({ label: formatDay(day.day), text: formatAmount(day.revenue), value: day.revenue }))}
      />
      <StatTile
        label={tiles.orders.label}
        value={String(data.orders.current)}
        delta={delta(data.orders)}
        trend={data.daily.map((day) => ({ label: formatDay(day.day), text: orderCount(day.orders, dashboard.orders), value: day.orders }))}
      />
      <StatTile
        label={tiles.average.label}
        value={data.approved.current > 0 ? formatAmount(Math.round(data.revenue.current / data.approved.current)) : "—"}
        caption={data.approved.current > 0 ? tiles.average.caption : tiles.average.empty}
      />
    </>
  );

  const trendChart = pending ? (
    <ChartSkeleton />
  ) : (
    <TrendChart
      days={data.daily}
      caption={trend.caption
        .replace("{amount}", formatAmount(data.revenue.current))
        .replace("{orders}", orderCount(data.approved.current, dashboard.payments))
        .replace("{range}", rangeText)}
    />
  );

  const performanceStrip = pending ? (
    <MetricStripSkeleton />
  ) : (
    <MetricStrip
      title={performance.title}
      metrics={[
        {
          label: performance.approval.label,
          value: formatPercent(approved, approved + rejected) || "—",
          caption:
            approved + rejected > 0
              ? performance.approval.caption.replace("{approved}", String(approved)).replace("{rejected}", String(rejected))
              : performance.approval.empty,
        },
        {
          label: performance.reviewTime.label,
          value: avgSeconds === null ? "—" : formatDuration(avgSeconds),
          caption: avgSeconds === null ? performance.reviewTime.empty : performance.reviewTime.caption,
        },
        {
          label: performance.paidRate.label,
          value: formatPercent(data.paid, data.orders.current) || "—",
          caption:
            data.orders.current > 0
              ? performance.paidRate.caption.replace("{paid}", String(data.paid)).replace("{orders}", String(data.orders.current))
              : performance.paidRate.empty,
        },
        { label: performance.today.label, value: String(data.ordersToday), caption: performance.today.caption },
      ]}
    />
  );

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="eyebrow">{dashboard.eyebrow}</span>
          <h1 className="admin-page__title">{dashboard.title}</h1>
          <p className="text-muted admin-page__lead">{dashboard.lead}</p>
        </div>
        <div className="admin-page__tools">
          <RangePicker current={range} onSelect={selectRange} />
          <p className="admin-page__meta mono" role="status">
            {pending ? dashboard.loading : dashboard.asOf.replace("{time}", formatIstTime(data.asOf))}
          </p>
        </div>
      </header>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="dash-kpis">
        {/* The one number this view leads with: what's waiting on the admin. */}
        <div className="card kpi kpi--hero theme-ink">
          <p className="kpi__label mono">{hero.label}</p>
          <p className="kpi__value">{toReview}</p>
          <p className="kpi__caption text-muted">
            {data.oldestWaitingSince ? hero.waiting.replace("{age}", formatAge(data.oldestWaitingSince, now)) : hero.none}
          </p>
          {toReview > 0 && (
            <Link className="button button--primary button--sm kpi__action" href={ordersLink({ status: "submitted" })}>
              {hero.cta}
              <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
            </Link>
          )}
        </div>
        {periodTiles}
      </div>

      <div className="dash-charts">
        {trendChart}
        <StatusMix counts={data.counts} />
      </div>

      {performanceStrip}

      <div className="dash-panels">
        <OrderPanel
          title={dashboard.queue.title}
          link={{ href: ordersLink({ status: "submitted" }), label: dashboard.queue.link }}
          empty={dashboard.queue.empty}
          orders={data.queue}
          meta={(order) => (order.submittedAt ? formatAge(order.submittedAt, now) : "")}
        />
        <OrderPanel
          title={dashboard.recent.title}
          link={{ href: ordersLink({ status: "all" }), label: dashboard.recent.link }}
          empty={dashboard.recent.empty}
          orders={data.recent}
          meta={(order) => (order.reviewedAt ? formatIst(order.reviewedAt) : "")}
          showStatus
        />
      </div>
    </div>
  );
}
