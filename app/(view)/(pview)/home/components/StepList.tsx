import type { LucideIcon } from "lucide-react";

export interface StepItem {
  label: string;
  description: string;
  icon?: LucideIcon;
}

interface StepListProps {
  items: StepItem[];
  /** Prefix each label with 01, 02…, and render an ordered list. */
  numbered?: boolean;
  /** Four across on wide screens (two on tablets) instead of three. */
  four?: boolean;
}

/** A row of steps, each led by a short red rule. Stacks on phones. */
export default function StepList({ items, numbered = true, four = false }: StepListProps) {
  const List = numbered ? "ol" : "ul";
  return (
    <List className={four ? "steps steps--four" : "steps"}>
      {items.map(({ label, description, icon: Icon }, index) => (
        <li key={label} className="step">
          <span className="step__label mono">
            {Icon && <Icon className="icon icon--sm step__icon" strokeWidth={1.75} />}
            {numbered ? `${String(index + 1).padStart(2, "0")} · ${label}` : label}
          </span>
          <p className="text-muted">{description}</p>
        </li>
      ))}
    </List>
  );
}
