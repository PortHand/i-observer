import { CircleAlert } from "lucide-react";

/** Inline error under a field, linked to the input with aria-describedby={id}. Renders nothing without a message. */
export default function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="field-error">
      <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
      {message}
    </span>
  );
}
