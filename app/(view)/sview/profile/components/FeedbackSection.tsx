"use client";

import { CircleAlert, CircleCheck, Hash, MessageSquare, Send } from "lucide-react";
import Dropdown from "@/components/common/Dropdown";
import FieldError from "@/components/common/FieldError";
import Spinner from "@/components/common/Spinner";
import { FEEDBACK_MAX, feedback, feedbackTopics } from "../content/profileContent";
import { useFeedbackHandler } from "../handler/useFeedbackHandler";
import type { CustomerFeedback } from "../services/profileService";
import FeedbackHistory from "./FeedbackHistory";
import RatingField from "./RatingField";

const topicOptions = feedbackTopics.map(({ id, label }) => ({ value: id, label }));

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

            <RatingField
              rating={rating}
              error={errors.rating}
              onChange={(value) => {
                setRating(value);
                clearError("rating");
              }}
            />

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
              <button type="submit" className="button button--primary button--lg" disabled={submitting} aria-busy={submitting || undefined}>
                {submitting ? <Spinner /> : <Send className="icon icon--sm" strokeWidth={1.75} />}
                {submitting ? feedback.sending : feedback.submit}
              </button>
            </div>
          </form>
        )}
      </div>

      <FeedbackHistory history={history} />
    </section>
  );
}
