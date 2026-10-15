import { dashboard } from "../content/adminContent";

/** A KPI tile's shape while its figures load. */
export const KpiSkeleton = () => (
  <div className="card kpi kpi--skeleton" aria-hidden="true">
    <span className="skeleton skeleton--line skeleton--small" style={{ width: "55%" }} />
    <span className="skeleton skeleton--value" />
    <span className="skeleton skeleton--line skeleton--small" style={{ width: "75%" }} />
    <span className="skeleton skeleton--spark" />
  </div>
);

/** The daily chart's shape while it loads: header lines, then columns of varied height. */
export const ChartSkeleton = () => (
  <section className="card chart" aria-hidden="true">
    <header className="chart__header">
      <span className="skeleton skeleton--line skeleton--small" style={{ width: "180px" }} />
      <span className="skeleton skeleton--line skeleton--small" style={{ width: "240px" }} />
    </header>
    <div className="chart-skeleton">
      {[40, 65, 30, 80, 55, 70, 45, 90, 60, 35, 75, 50, 85, 40, 65].map((height, index) => (
        <span key={index} className="skeleton" style={{ height: `${height}%` }} />
      ))}
    </div>
  </section>
);

/** The performance strip's shape while it loads. */
export const MetricStripSkeleton = () => (
  <section className="card metrics" aria-hidden="true">
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="metrics__item">
        <span className="skeleton skeleton--line skeleton--small" style={{ width: "60%" }} />
        <span className="skeleton skeleton--figure" />
        <span className="skeleton skeleton--line skeleton--small" style={{ width: "80%" }} />
      </div>
    ))}
  </section>
);

/** The whole dashboard's shape while it first loads. */
export default function DashboardSkeleton() {
  return (
    <div className="admin-page" aria-hidden="true">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="eyebrow">{dashboard.eyebrow}</span>
          <h1 className="admin-page__title">{dashboard.title}</h1>
          <p className="text-muted admin-page__lead">{dashboard.lead}</p>
        </div>
        <span className="skeleton skeleton--segmented" />
      </header>
      <div className="dash-kpis">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
      <div className="dash-charts">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <MetricStripSkeleton />
    </div>
  );
}
