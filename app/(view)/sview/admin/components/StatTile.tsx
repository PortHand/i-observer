import type { ReactNode } from "react";

/** A headline number: label, value, and a caption that gives it context. */
export default function StatTile({ label, value, caption }: { label: string; value: string; caption: ReactNode }) {
  return (
    <div className="card kpi">
      <p className="kpi__label mono">{label}</p>
      <p className="kpi__value">{value}</p>
      <p className="kpi__caption text-muted">{caption}</p>
    </div>
  );
}
