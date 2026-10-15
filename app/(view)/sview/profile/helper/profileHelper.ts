import { FEEDBACK_MAX, FEEDBACK_MIN, feedback, feedbackTopics, type FeedbackTopic } from "../content/profileContent";

export type FeedbackField = "rating" | "topic" | "message" | "reference";

export interface FeedbackInput {
  rating: number;
  topic: FeedbackTopic;
  message: string;
  /** Order reference, or "" when it isn't about an order. */
  reference: string;
}

export type FeedbackParse = { ok: true; input: FeedbackInput } | { ok: false; errors: Partial<Record<FeedbackField, string>> };

const text = (data: FormData, field: string) => String(data.get(field) ?? "").trim();

/** Checks the feedback form. Used in the browser and again by the Server Action, so messages match. */
export const parseFeedbackForm = (data: FormData): FeedbackParse => {
  const rating = Number(text(data, "rating"));
  const topic = text(data, "topic");
  const message = text(data, "message");
  const reference = text(data, "reference").toUpperCase();

  const errors: Partial<Record<FeedbackField, string>> = {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = feedback.errors.rating;
  if (!feedbackTopics.some((item) => item.id === topic)) errors.topic = feedback.errors.topic;
  if (message.length < FEEDBACK_MIN) errors.message = feedback.errors.messageShort;
  else if (message.length > FEEDBACK_MAX) errors.message = feedback.errors.messageLong;
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, input: { rating, topic: topic as FeedbackTopic, message, reference } };
};

export const topicLabel = (id: FeedbackTopic) => feedbackTopics.find((topic) => topic.id === id)?.label ?? id;

/** Dates in IST, where customers are: "15 Oct 2026". */
export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(iso));

/** "15 Oct 2026, 2:24 pm" in IST. */
export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(iso));

/** Whole days from `now` until `iso`, at least 0. */
export const daysUntil = (iso: string, now = Date.now()) => Math.max(0, Math.ceil((Date.parse(iso) - now) / 86_400_000));
