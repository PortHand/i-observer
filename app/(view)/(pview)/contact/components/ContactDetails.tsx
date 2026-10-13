import Link from "next/link";
import { ArrowRight, Check, Clock, Copy, Mail } from "lucide-react";
import { beforeYouWrite, contactEmail } from "../content/contactContent";

interface ContactDetailsProps {
  copied: boolean;
  onCopy: (email: string) => void;
}

export default function ContactDetails({ copied, onCopy }: ContactDetailsProps) {
  return (
    <aside className="contact-details">
      <div className="email-card">
        <span className="icon-tile">
          <Mail className="icon" strokeWidth={1.75} />
        </span>
        <span className="field__label">{contactEmail.label}</span>
        <a className="email-card__address" href={`mailto:${contactEmail.address}`}>
          {contactEmail.address}
        </a>
        <p className="hint">
          <Clock className="icon icon--sm" strokeWidth={1.75} />
          {contactEmail.responseTime}
        </p>
        <div className="email-card__actions">
          <button
            type="button"
            className="button button--secondary button--sm"
            onClick={() => onCopy(contactEmail.address)}
          >
            {copied ? (
              <Check className="icon icon--sm" strokeWidth={1.75} />
            ) : (
              <Copy className="icon icon--sm" strokeWidth={1.75} />
            )}
            <span aria-live="polite">{copied ? contactEmail.copied : contactEmail.copy}</span>
          </button>
          <a className="button button--ghost button--sm" href={`mailto:${contactEmail.address}`}>
            {contactEmail.open}
            <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
          </a>
        </div>
      </div>

      <div className="help-list">
        <h2 className="field__label">{beforeYouWrite.title}</h2>
        <ul>
          {beforeYouWrite.items.map(({ title, text, link }) => (
            <li key={title}>
              <span className="help-list__title">{title}</span>
              <span className="text-muted">{text}</span>
              {link && (
                <Link className="text-link help-list__link" href={link.href}>
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
