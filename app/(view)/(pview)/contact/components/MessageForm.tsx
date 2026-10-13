import type { FormEvent, RefObject } from "react";
import { CircleAlert, Hash, Mail, MessageSquare, Phone, Send, User } from "lucide-react";
import Dropdown from "@/components/common/Dropdown";
import { MESSAGE_MAX, form, topics, type TopicId } from "../content/contactContent";
import type { ContactField, ContactPrefill } from "../helper/contactHelper";

interface MessageFormProps {
  /** Values filled in from the URL. */
  defaults: ContactPrefill;
  topic: TopicId | "";
  showReference: boolean;
  referenceRequired: boolean;
  messageLength: number;
  errors: Partial<Record<ContactField, string>>;
  sendError: string;
  submitting: boolean;
  formRef: RefObject<HTMLFormElement | null>;
  onTopicChange: (topic: TopicId | "") => void;
  onMessageLengthChange: (length: number) => void;
  onEdit: (field: ContactField) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const topicOptions = topics.map(({ id, label, description }) => ({ value: id, label, description }));

/** Red asterisk after a required field's label; screen readers get `required` from the input. */
const RequiredMark = () => (
  <span className="field__required" aria-hidden="true">
    *
  </span>
);

/** Inline error under a field, linked to the input with aria-describedby. */
const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <span id={id} className="field-error">
      <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
      {message}
    </span>
  ) : null;

export default function MessageForm({
  defaults,
  topic,
  showReference,
  referenceRequired,
  messageLength,
  errors,
  sendError,
  submitting,
  formRef,
  onTopicChange,
  onMessageLengthChange,
  onEdit,
  onSubmit,
}: MessageFormProps) {
  const describe = (field: ContactField) => (errors[field] ? `${field}-error` : undefined);
  const invalid = (field: ContactField) => (errors[field] ? true : undefined);

  return (
    <form ref={formRef} className="form" noValidate onSubmit={onSubmit}>
      <header className="auth__header">
        <span className="mono accent">{form.label}</span>
        <h2>{form.title}</h2>
        <p className="text-muted">{form.description}</p>
      </header>

      <div className="field-grid">
        <label className="field">
          <span className="field__label">
            {form.nameLabel}
            <RequiredMark />
          </span>
          <span className="input-group">
            <User className="icon" strokeWidth={1.75} />
            <input
              className="input"
              name="name"
              autoComplete="name"
              placeholder={form.namePlaceholder}
              aria-invalid={invalid("name")}
              aria-describedby={describe("name")}
              onInput={() => onEdit("name")}
              required
            />
          </span>
          <FieldError id="name-error" message={errors.name} />
        </label>

        <label className="field">
          <span className="field__label">
            {form.emailLabel}
            <RequiredMark />
          </span>
          <span className="input-group">
            <Mail className="icon" strokeWidth={1.75} />
            <input
              className="input"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={form.emailPlaceholder}
              defaultValue={defaults.email}
              aria-invalid={invalid("email")}
              aria-describedby={describe("email")}
              onInput={() => onEdit("email")}
              required
            />
          </span>
          <FieldError id="email-error" message={errors.email} />
        </label>

        <label className="field">
          <span className="field__label">{form.phoneLabel}</span>
          <span className="input-group">
            <Phone className="icon" strokeWidth={1.75} />
            <span className="input-prefix mono" aria-hidden="true">
              {form.phonePrefix}
            </span>
            <input
              className="input input--prefixed"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder={form.phonePlaceholder}
              aria-invalid={invalid("phone")}
              aria-describedby={describe("phone")}
              onInput={() => onEdit("phone")}
            />
          </span>
          <FieldError id="phone-error" message={errors.phone} />
        </label>

        {/* A div, not a label: the dropdown is a button, labelled through labelledBy. */}
        <div className="field">
          <span className="field__label">
            <span id="topic-label">{form.topicLabel}</span>
            <RequiredMark />
          </span>
          <Dropdown
            id="field-topic"
            name="topic"
            icon={MessageSquare}
            options={topicOptions}
            value={topic}
            placeholder={form.topicPlaceholder}
            labelledBy="topic-label"
            describedBy={describe("topic")}
            invalid={invalid("topic")}
            onChange={(next) => {
              onTopicChange(next);
              onEdit("topic");
            }}
          />
          <FieldError id="topic-error" message={errors.topic} />
        </div>
      </div>

      {showReference && (
        <label className="field">
          <span className="field__label">
            {form.referenceLabel}
            {referenceRequired ? <RequiredMark /> : ` ${form.referenceOptional}`}
          </span>
          <span className="input-group">
            <Hash className="icon" strokeWidth={1.75} />
            <input
              className="input mono-input"
              name="reference"
              autoComplete="off"
              placeholder={form.referencePlaceholder}
              defaultValue={defaults.reference}
              aria-invalid={invalid("reference")}
              aria-describedby={describe("reference") ?? "reference-hint"}
              onInput={() => onEdit("reference")}
              required={referenceRequired}
            />
          </span>
          {errors.reference ? (
            <FieldError id="reference-error" message={errors.reference} />
          ) : (
            <span id="reference-hint" className="hint">
              {form.referenceHint}
            </span>
          )}
        </label>
      )}

      <label className="field">
        <span className="field__label field__label--split">
          <span>
            {form.messageLabel}
            <RequiredMark />
          </span>
          <span className={messageLength > MESSAGE_MAX ? "counter counter--over" : "counter"} aria-hidden="true">
            {messageLength}/{MESSAGE_MAX}
          </span>
        </span>
        <textarea
          className="input textarea"
          name="message"
          rows={6}
          placeholder={form.messagePlaceholder}
          defaultValue={defaults.message}
          aria-invalid={invalid("message")}
          aria-describedby={describe("message")}
          onInput={(event) => {
            onMessageLengthChange(event.currentTarget.value.length);
            onEdit("message");
          }}
          required
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
        <p className="hint">{form.privacy}</p>
        <button type="submit" className="button button--primary button--lg" disabled={submitting}>
          <Send className="icon icon--sm" strokeWidth={1.75} />
          {form.submit}
        </button>
      </div>
    </form>
  );
}
