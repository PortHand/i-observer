/** A row of smaller figures in one card, split by hairlines. */
export default function MetricStrip({ title, metrics }: { title: string; metrics: { label: string; value: string; caption: string }[] }) {
  return (
    <section className="card metrics" aria-label={title}>
      {metrics.map((metric) => (
        <div key={metric.label} className="metrics__item">
          <p className="kpi__label mono">{metric.label}</p>
          <p className="metrics__value">{metric.value}</p>
          <p className="kpi__caption text-muted">{metric.caption}</p>
        </div>
      ))}
    </section>
  );
}
