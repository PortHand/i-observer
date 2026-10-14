import type { RefObject } from "react";
import Link from "next/link";
import { Check, CircleAlert, Download, LifeBuoy, Mail } from "lucide-react";
import { contactLink } from "../../contact/helper/contactHelper";
import { checkout } from "../content/getContent";
import {
  formatDateTime,
  loginExpectedBy,
  type TransactionSummary,
} from "../helper/getHelper";

interface ConfirmationProps {
  summary: TransactionSummary;
  downloading: boolean;
  downloadError: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onDownload: () => void;
}

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);

export default function Confirmation({
  summary,
  downloading,
  downloadError,
  headingRef,
  onDownload,
}: ConfirmationProps) {
  const { done } = checkout;
  const values = {
    email: summary.email,
    utr: summary.utr,
    reference: summary.reference,
    loginBy: formatDateTime(loginExpectedBy(summary.submittedAt)),
    submitted: formatDateTime(summary.submittedAt),
  };
  const [before, after] = done.message.split("{email}");
  const steps = [
    { ...done.next.received, state: "done" },
    { ...done.next.verifying, state: "current" },
    { ...done.next.emailed, state: "todo" },
  ];
  const supportHref = contactLink({
    topic: "login",
    reference: summary.reference,
    email: summary.email,
    message: fill(done.supportMessage, values),
  });

  return (
    <div className="success">
      <header className="success__header">
        <span className="success__tick" aria-hidden="true">
          <Check strokeWidth={2.5} />
        </span>
        <div className="success__heading">
          <h3 ref={headingRef} tabIndex={-1}>
            {done.title}
          </h3>
          <p className="success__meta mono">
            {summary.reference} · {formatDateTime(summary.submittedAt)}
          </p>
        </div>
      </header>

      <p className="success__message">
        <Mail className="icon" strokeWidth={1.75} />
        <span>
          {before}
          <strong>{summary.email}</strong>
          {after}
        </span>
      </p>

      <section className="timeline" aria-labelledby="next-steps-title">
        <h4 id="next-steps-title" className="field__label">
          {done.nextTitle}
        </h4>
        <ol>
          {steps.map(({ title, detail, state }, index) => (
            <li key={title} className={`timeline__item timeline__item--${state}`}>
              <span className="timeline__marker mono" aria-hidden="true">
                {state === "done" ? <Check className="icon icon--sm" strokeWidth={2.5} /> : index + 1}
              </span>
              <span className="timeline__text">
                <span className="timeline__title">{title}</span>
                <span className="timeline__detail">{fill(detail, values)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <button
        type="button"
        className="button button--primary button--lg button--block"
        onClick={onDownload}
        disabled={downloading}
      >
        <Download className="icon" strokeWidth={1.75} />
        {done.download}
      </button>
      {downloadError && (
        <p className="form-error" role="alert">
          <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
          <span>{downloadError}</span>
        </p>
      )}

      <aside className="support-note">
        <LifeBuoy className="icon support-note__icon" strokeWidth={1.75} />
        <div className="support-note__text">
          <p className="support-note__title">{done.supportTitle}</p>
          <p>{fill(done.supportText, values)}</p>
        </div>
        <Link className="button button--secondary button--sm" href={supportHref}>
          {done.supportCta}
        </Link>
      </aside>
    </div>
  );
}
