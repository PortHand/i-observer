"use client";

import { CircleAlert, CircleCheck, Hash, MessageSquare, Send, Star } from "lucide-react";
import Dropdown from "@/components/common/Dropdown";
import { FEEDBACK_MAX, feedback, feedbackTopics } from "../content/profileContent";
import { formatDate, topicLabel } from "../helper/profileHelper";
import { useFeedbackHandler } from "../handler/useFeedbackHandler";
import type { CustomerFeedback } from "../services/profileService";

const topicOptions = feedbackTopics.map(({ id, label }) => ({ value: id, label }));

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <span id={id} className="field-error">
      <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
      {message}
    </span>
  ) : null;

const Stars = ({ rating }: { rating: number }) => (
  <span className="stars" aria-label={`${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((value) => (
      <Star key={value} className={value <= rating ? "icon icon--sm stars__on" : "icon icon--sm"} strokeWidth={1.75} />
    ))}
  </span>
);

/** Rating, topic, optional order and a note, plus the customer's earlier feedback. */
export default function FeedbackSection({ references, initial }: { references: string[]; initial: CustomerFeedback[] }) {
  const {
    rating,
    topic,
    reference,
    messageLength,
    errors,
    sendError,
    submitting,
    sent,
    history,
    formRef,
    setRating,
    setTopic,
    setReference,
    setMessageLength,
    clearError,
    handleSubmit,
    handleSendAnother,
  } = useFeedbackHandler(initial);
  const describe = (field: string) => (errors[field as keyof typeof errors] ? `${field}-error` : undefined);
  const orderOptions = [{ value: "", label: feedback.orderNone }, ...references.map((reference) => ({ value: reference, label: reference }))];

  return (
    <section className="profile-section" aria-labelledby="feedback-title">
      <div className="card feedback">
        {sent ? (
          <div className="feedback__sent" role="status">
            <CircleCheck className="icon feedback__sent-icon" strokeWidth={1.75} />
            <p>{feedback.sent}</p>
            <button type="button" className="button button--secondary" onClick={handleSendAnother}>
              {feedback.another}
            </button>
          </div>
        ) : (
          <form ref={formRef} className="form" noValidate onSubmit={handleSubmit}>
            <header className="auth__header">
              <span className="mono accent">{feedback.label}</span>
              <h2 id="feedback-title">{feedback.title}</h2>
              <p className="text-muted">{feedback.description}</p>
            </header>

            <fieldset className="field rating" aria-describedby={describe("rating")}>
              <legend className="field__label">{feedback.ratingLabel}</legend>
              <div className="rating__options">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="rating__option" title={feedback.ratings[value - 1]}>
                    <input
                      type="radio"
                      name="rating"
                      value={value}
                      checked={rating === value}
                      onChange={() => {
                        setRating(value);
                        clearError("rating");
                      }}
                    />
                    <Star className={value <= rating ? "icon rating__star rating__star--on" : "icon rating__star"} strokeWidth={1.75} />
                    <span className="sr-only">{feedback.ratings[value - 1]}</span>
                  </label>
                ))}
                <span className="rating__word mono">{rating ? feedback.ratings[rating - 1] : ""}</span>
              </div>
              <FieldError id="rating-error" message={errors.rating} />
            </fieldset>

            <div className="field-grid">
              <div className="field">
                <span className="field__label" id="topic-label">
                  {feedback.topicLabel}
                </span>
                <Dropdown
                  id="field-topic"
                  name="topic"
                  icon={MessageSquare}
                  options={topicOptions}
                  value={topic}
                  placeholder={feedback.topicPlaceholder}
                  labelledBy="topic-label"
                  describedBy={describe("topic")}
                  invalid={errors.topic ? true : undefined}
                  onChange={(next) => {
                    setTopic(next);
                    clearError("topic");
                  }}
                />
                <FieldError id="topic-error" message={errors.topic} />
              </div>
              {references.length > 0 && (
                <div className="field">
                  <span className="field__label" id="reference-label">
                    {feedback.orderLabel}
                  </span>
                  <Dropdown
                    id="field-reference"
                    name="reference"
                    icon={Hash}
                    options={orderOptions}
                    value={reference}
                    placeholder={feedback.orderNone}
                    labelledBy="reference-label"
                    describedBy={describe("reference")}
                    invalid={errors.reference ? true : undefined}
                    onChange={(next) => {
                      setReference(next);
                      clearError("reference");
                    }}
                  />
                  <FieldError id="reference-error" message={errors.reference} />
                </div>
              )}
            </div>

            <label className="field">
              <span className="field__label field__label--split">
                <span>{feedback.messageLabel}</span>
                <span className={messageLength > FEEDBACK_MAX ? "counter counter--over" : "counter"} aria-hidden="true">
                  {messageLength}/{FEEDBACK_MAX}
                </span>
              </span>
              <textarea
                className="input textarea"
                name="message"
                rows={5}
                placeholder={feedback.messagePlaceholder}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={describe("message")}
                onInput={(event) => {
                  setMessageLength(event.currentTarget.value.length);
                  clearError("message");
                }}
              />
              <FieldError id="message-error" message={errors.message} />
            </label>

            {sendError && (
              <p className="form-error" role="alert">
                <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
                <span>{sendError}</span>
              </p>
            )}

            <div className="form-footer">
              <span />
              <button type="submit" className="button button--primary button--lg" disabled={submitting}>
                <Send className="icon icon--sm" strokeWidth={1.75} />
                {submitting ? feedback.sending : feedback.submit}
              </button>
            </div>
          </form>
        )}
      </div>

      {history.length > 0 && (
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
      )}
    </section>
  );
}
