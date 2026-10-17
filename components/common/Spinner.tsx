import { LoaderCircle } from "lucide-react";

/** A small rotating loader for buttons and status lines. Pair it with text: it is hidden from screen readers. */
export default function Spinner({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <LoaderCircle
      className={size === "sm" ? "icon icon--sm spin" : "icon spin"}
      strokeWidth={1.75}
      aria-hidden="true"
    />
  );
}
