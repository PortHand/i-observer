import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatChange } from "../helper/adminHelper";
import Sparkline from "./Sparkline";

interface StatTileProps {
  label: string;
  value: string;
  caption?: ReactNode;
  /** Change against the previous period (0.25 is +25%), with what it's compared to. Null change: nothing to compare. */
  delta?: { change: number | null; versus: string; none: string };
  /** Values over the period, oldest first, drawn as a sparkline. */
  trend?: number[];
}

/** A headline number: label, value, and what gives it context (a caption, a change, a trend). */
export default function StatTile({ label, value, caption, delta, trend }: StatTileProps) {
  const direction = delta?.change == null || delta.change === 0 ? "flat" : delta.change > 0 ? "up" : "down";
  const Icon = direction === "down" ? TrendingDown : TrendingUp;

  return (
    <div className="card kpi">
      <p className="kpi__label mono">{label}</p>
      <p className="kpi__value">{value}</p>
      {delta && (
        <p className="kpi__caption">
          {delta.change === null ? (
            <span className="text-muted">{delta.none}</span>
          ) : (
            <>
              <span className={`kpi__delta kpi__delta--${direction}`}>
                {direction !== "flat" && <Icon className="icon icon--sm" strokeWidth={1.75} aria-hidden="true" />}
                {formatChange(delta.change)}
              </span>
              <span className="text-muted">{delta.versus}</span>
            </>
          )}
        </p>
      )}
      {caption && <p className="kpi__caption text-muted">{caption}</p>}
      {trend && <Sparkline values={trend} />}
    </div>
  );
}
