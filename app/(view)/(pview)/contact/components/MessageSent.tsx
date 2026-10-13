import type { RefObject } from "react";
import { Check, RotateCcw } from "lucide-react";
import { sent as content } from "../content/contactContent";
import type { ContactMessage } from "../helper/contactHelper";

interface MessageSentProps {
  message: ContactMessage;
  ticket: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onSendAnother: () => void;
}

export default function MessageSent({ message, ticket, headingRef, onSendAnother }: MessageSentProps) {
  const text = content.text.replace("{name}", message.name.split(" ")[0]).replace("{email}", message.email);

  return (
    <div className="message-sent" role="status">
      <span className="message-sent__tick" aria-hidden="true">
        <Check strokeWidth={2.5} />
      </span>
      <h2 ref={headingRef} tabIndex={-1}>
        {content.title}
      </h2>
      <p className="text-muted">{text}</p>
      <p className="message-sent__ticket mono">
        {content.ticketLabel} {ticket}
      </p>
      <button type="button" className="button button--secondary" onClick={onSendAnother}>
        <RotateCcw className="icon icon--sm" strokeWidth={1.75} />
        {content.another}
      </button>
    </div>
  );
}
