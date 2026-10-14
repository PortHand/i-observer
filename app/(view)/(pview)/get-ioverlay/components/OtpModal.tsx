import type { FormEvent } from "react";
import { CircleAlert, KeyRound, ShieldCheck } from "lucide-react";
import Modal from "@/components/common/Modal";
import { checkout } from "../content/getContent";

interface OtpModalProps {
  open: boolean;
  /** Address the code was emailed to. */
  email: string;
  error: string;
  /** Shown after a resend, e.g. "New code sent." */
  notice: string;
  submitting: boolean;
  /** Seconds until "Resend code" unlocks. */
  resendIn: number;
  onVerify: (event: FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
  onChangeEmail: () => void;
  onClose: () => void;
}

/** Opens on "Generate QR code" while the email isn't verified: enter the emailed code to continue. */
export default function OtpModal({
  open,
  email,
  error,
  notice,
  submitting,
  resendIn,
  onVerify,
  onResend,
  onChangeEmail,
  onClose,
}: OtpModalProps) {
  const { contact } = checkout;
  const { otp } = contact;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={otp.eyebrow}
      title={otp.title}
      description={otp.description.replace("{email}", email)}
      closeLabel={otp.close}
    >
      {/* Keyed by email, so a code typed for one address is cleared when another is entered. */}
      <form key={email} className="form" noValidate onSubmit={onVerify}>
        <label className="field">
          <span className="field__label">{contact.codeLabel}</span>
          <span className="input-group">
            <KeyRound className="icon" strokeWidth={1.75} />
            <input
              className="input otp__input mono"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder={contact.codePlaceholder}
              data-autofocus
              required
            />
          </span>
        </label>

        {error && (
          <p className="form-error" role="alert">
            <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
            <span>{error}</span>
          </p>
        )}
        {notice && !error && (
          <p className="hint" role="status">
            {notice}
          </p>
        )}

        <button type="submit" className="button button--primary button--lg button--block" disabled={submitting}>
          <ShieldCheck className="icon" strokeWidth={1.75} />
          {otp.verify}
        </button>
        <div className="otp__actions">
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={onResend}
            disabled={submitting || resendIn > 0}
          >
            {resendIn > 0 ? contact.resendIn.replace("{seconds}", String(resendIn)) : contact.resend}
          </button>
          <button type="button" className="button button--ghost button--sm" onClick={onChangeEmail} disabled={submitting}>
            {contact.changeEmail}
          </button>
        </div>
      </form>
    </Modal>
  );
}
