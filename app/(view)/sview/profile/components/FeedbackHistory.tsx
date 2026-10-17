import { Star } from "lucide-react";
import { feedback } from "../content/profileContent";
import { formatDate, topicLabel } from "../helper/profileHelper";
import type { CustomerFeedback } from "../services/profileService";

const Stars = ({ rating }: { rating: number }) => (
  <span className="stars" aria-label={`${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((value) => (
      <Star key={value} className={value <= rating ? "icon icon--sm stars__on" : "icon icon--sm"} strokeWidth={1.75} />
    ))}
  </span>
);

/** The customer's earlier feedback, newest first. Renders nothing when there is none. */
export default function FeedbackHistory({ history }: { history: CustomerFeedback[] }) {
  if (history.length === 0) return null;
  return (
    <div className="feedback-history">
      <span className="section-label">{feedback.history}</span>
      <ul className="feedback-history__list">
        {history.map((entry) => (
          <li key={entry.id} className="feedback-history__item">
            <div className="feedback-history__meta">
              <Stars rating={entry.rating} />
              <span className="mono">{topicLabel(entry.topic)}</span>
              {entry.reference && <span className="mono">{entry.reference}</span>}
              <span className="mono text-muted">{formatDate(entry.createdAt)}</span>
            </div>
            <p>{entry.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
