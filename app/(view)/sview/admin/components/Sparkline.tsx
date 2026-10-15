import type { CSSProperties } from "react";

export interface SparkPoint {
  /** The day, e.g. "15 Oct". */
  label: string;
  /** The value as shown, e.g. "₹499". */
  text: string;
  value: number;
}

/**
 * A small line of `points` (oldest first) under a figure. Hovering shows the nearest day's value
 * in a tooltip. The figure beside it carries the total, so it's hidden from
 * screen readers.
 */
export default function Sparkline({ points }: { points: SparkPoint[] }) {
  if (points.length < 2) return null;
  const max = Math.max(...points.map((point) => point.value), 1);
  const last = points.length - 1;
  // 100 × 32 box; the line keeps 2px clear of the top so the peak isn't cut.
  const y = (value: number) => 32 - (value / max) * 30;
  const line = points.map((point, index) => `${(index / last) * 100},${y(point.value)}`).join(" ");
  // Tooltips near the edges open inwards so they stay inside the tile.
  const edge = Math.max(1, Math.round(points.length * 0.2));

  return (
    <div className="sparkline" aria-hidden="true">
      <svg className="sparkline__svg" viewBox="0 0 100 32" preserveAspectRatio="none" focusable="false">
        <polygon className="sparkline__area" points={`0,32 ${line} 100,32`} />
        <polyline className="sparkline__line" points={line} />
      </svg>
      {/* One hover zone per point, centred on it, each with its own tooltip. */}
      {points.map((point, index) => {
        const side = index < edge ? " sparkline__zone--start" : index > last - edge ? " sparkline__zone--end" : "";
        // The zone runs halfway to each neighbour (in % of the width); the tooltip points at the day inside it.
        const x = (index / last) * 100;
        const start = Math.max(0, x - 50 / last);
        const end = Math.min(100, x + 50 / last);
        const style = {
          left: `${start}%`,
          width: `${end - start}%`,
          "--x": `${((x - start) / (end - start)) * 100}%`,
        } as CSSProperties;
        return (
          <span key={index} className={`sparkline__zone${side}`} style={style}>
            <span className="chart-tip">
              <span className="chart-tip__title">{point.label}</span>
              <strong className="chart-tip__value">{point.text}</strong>
            </span>
          </span>
        );
      })}
    </div>
  );
}
