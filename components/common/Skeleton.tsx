import type { CSSProperties, ReactNode } from "react";

interface SkeletonProps {
  /** Shape modifiers from app/globals.css, e.g. "line", "small", "title", "button". */
  variant?: "line" | "small" | "title" | "button";
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  className?: string;
}

/** A shimmering block standing in for content that's still loading. Decorative: hidden from screen readers. */
export default function Skeleton({ variant, width, height, className }: SkeletonProps) {
  const classes = ["skeleton", variant && `skeleton--${variant}`, className].filter(Boolean).join(" ");
  return <span className={classes} style={width || height ? { width, height } : undefined} aria-hidden="true" />;
}

/**
 * Wraps a loading placeholder: marks it busy and gives screen readers one short status line,
 * since the skeleton blocks themselves are hidden from them.
 */
export function SkeletonRegion({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className} aria-busy="true">
      <span className="visually-hidden" role="status">
        {label}
      </span>
      {children}
    </div>
  );
}
