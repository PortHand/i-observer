/** A small line of `values` (oldest first) under a figure. Decorative: the figure beside it carries the number. */
export default function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  // 100 × 32 box; the line keeps 2px clear of the top so the peak isn't cut.
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${32 - (value / max) * 30}`);
  const line = points.join(" ");

  return (
    <svg className="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <polygon className="sparkline__area" points={`0,32 ${line} 100,32`} />
      <polyline className="sparkline__line" points={line} />
    </svg>
  );
}
