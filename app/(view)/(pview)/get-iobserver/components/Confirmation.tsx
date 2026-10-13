import type { RefObject } from "react";
import { Check, CircleAlert, CircleCheck, Copy, Download, Info, Mail, RotateCcw, Share2 } from "lucide-react";
import { checkout } from "../content/getContent";
import type { CopyTarget } from "../handler/useCheckoutHandler";
import { receiptRows, summaryText, supportMailto, type TransactionSummary } from "../helper/getHelper";

interface ConfirmationProps {
  summary: TransactionSummary;
  copied: CopyTarget | null;
  downloading: boolean;
  downloadError: string;
  canShare: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onCopy: (target: CopyTarget, text: string) => void;
  onShare: () => void;
  onDownload: () => void;
  onStartOver: () => void;
}

export default function Confirmation({
  summary,
  copied,
  downloading,
  downloadError,
  canShare,
  headingRef,
  onCopy,
  onShare,
  onDownload,
  onStartOver,
}: ConfirmationProps) {
  const { done } = checkout;
  const text = summaryText(summary);
  const rows = receiptRows(summary);

  return (
    <div className="form">
      <header className="auth__header">
        <span className="mono confirmation__label">
          <CircleCheck className="icon icon--sm" strokeWidth={1.75} />
          {done.label}
        </span>
        <h3 ref={headingRef} tabIndex={-1}>
          {done.title}
        </h3>
        <p className="text-muted">{done.description}</p>
      </header>

      <dl className="receipt">
        {rows.map(({ label, value }) => (
          <div key={label} className="receipt__row">
            <dt className="field__label">{label}</dt>
            <dd className="mono">{value}</dd>
          </div>
        ))}
      </dl>

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
      <div className="form-actions form-actions--stretch">
        {canShare && (
          <button type="button" className="button button--secondary" onClick={onShare}>
            <Share2 className="icon icon--sm" strokeWidth={1.75} />
            {done.share}
          </button>
        )}
        <button
          type="button"
          className="button button--secondary"
          onClick={() => onCopy("summary", text)}
        >
          {copied === "summary" ? (
            <Check className="icon icon--sm" strokeWidth={1.75} />
          ) : (
            <Copy className="icon icon--sm" strokeWidth={1.75} />
          )}
          <span aria-live="polite">{copied === "summary" ? done.copied : done.copy}</span>
        </button>
      </div>
      <a
        className="hint text-link"
        href={supportMailto(`iObserver payment ${summary.reference}`, text)}
      >
        <Mail className="icon icon--sm" strokeWidth={1.75} />
        {done.emailCopy}
      </a>

      <p className="hint">
        <Info className="icon icon--sm" strokeWidth={1.75} />
        {done.help}
      </p>
      <button type="button" className="button button--ghost button--sm" onClick={onStartOver}>
        <RotateCcw className="icon icon--sm" strokeWidth={1.75} />
        {done.startOver}
      </button>
    </div>
  );
}
