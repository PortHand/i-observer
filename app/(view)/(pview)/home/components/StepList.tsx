import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

export interface StepItem {
  label: string;
  description: string;
  icon?: LucideIcon;
}

interface StepListProps {
  items: StepItem[];
  /** Number each step 01, 02… on its timeline node, and render an ordered list. */
  numbered?: boolean;
  /** Four across on wide screens (two on tablets) instead of three. */
  four?: boolean;
}

/** A row of steps on a timeline, each led by a node (its number or icon). Stacks on phones. */
export default function StepList({ items, numbered = true, four = false }: StepListProps) {
  const List = numbered ? "ol" : "ul";
  return (
    <List className={four ? "steps steps--four" : "steps"}>
      {items.map(({ label, description, icon: Icon }, index) => (
        <li key={label} className="step" data-reveal style={{ "--reveal-order": index % 4 } as CSSProperties}>
          <span className="step__node mono" aria-hidden="true">
            {Icon ? (
              <Icon className="icon icon--sm" strokeWidth={1.75} />
            ) : numbered ? (
              String(index + 1).padStart(2, "0")
            ) : (
              <span className="step__dot" />
            )}
          </span>
          <span className="step__label">{label}</span>
          <p className="text-muted">{description}</p>
        </li>
      ))}
    </List>
  );
}
