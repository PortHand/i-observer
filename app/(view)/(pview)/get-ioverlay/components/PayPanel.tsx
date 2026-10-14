import type { RefObject } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, ArrowRight, Check, Copy, Smartphone } from "lucide-react";
import { checkout } from "../content/getContent";
import type { CopyTarget } from "../handler/useCheckoutHandler";
import { buildUpiLink, formatAmount } from "../helper/getHelper";
import type { Order } from "../services/getService";

interface PayPanelProps {
  order: Order;
  copied: CopyTarget | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onCopy: (target: CopyTarget, text: string) => void;
  onBack: () => void;
  onPaid: () => void;
}

export default function PayPanel({ order, copied, headingRef, onCopy, onBack, onPaid }: PayPanelProps) {
  const { pay } = checkout;
  const upiLink = buildUpiLink(order);
  const copyRows: { target: CopyTarget; label: string; value: string }[] = [
    { target: "upi", label: pay.upiLabel, value: order.payee.upiId },
    { target: "reference", label: pay.referenceLabel, value: order.reference },
  ];

  return (
    <div className="form">
      <header className="auth__header">
        <span className="mono accent">{pay.label}</span>
        <h3 ref={headingRef} tabIndex={-1}>
          {pay.title}
        </h3>
        <p className="text-muted">{pay.description}</p>
      </header>

      <div className="qr">
        <div className="qr__code">
          {/* Always dark on white: some UPI scanners can't read inverted codes. */}
          <QRCodeSVG
            value={upiLink}
            size={208}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#242321"
            title={pay.qrAlt}
          />
        </div>
        <p className="qr__amount display">{formatAmount(order.amount)}</p>
        <p className="qr__payee mono">{order.planLabel}</p>
      </div>

      <dl className="copy-list">
        {copyRows.map(({ target, label, value }) => (
          <div key={target} className="copy-row">
            <dt className="field__label">{label}</dt>
            <dd className="copy-row__value mono">{value}</dd>
            <dd>
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => onCopy(target, value)}
                aria-label={`${pay.copy} ${label}`}
              >
                {copied === target ? (
                  <Check className="icon icon--sm" strokeWidth={1.75} />
                ) : (
                  <Copy className="icon icon--sm" strokeWidth={1.75} />
                )}
                <span aria-live="polite">{copied === target ? pay.copied : pay.copy}</span>
              </button>
            </dd>
          </div>
        ))}
      </dl>
      <p className="hint">{pay.referenceHint}</p>

      <a className="button button--secondary button--block upi-app-link" href={upiLink}>
        <Smartphone className="icon icon--sm" strokeWidth={1.75} />
        {pay.openApp}
      </a>

      <div className="form-actions">
        <button type="button" className="button button--ghost" onClick={onBack}>
          <ArrowLeft className="icon icon--sm" strokeWidth={1.75} />
          {pay.back}
        </button>
        <button type="button" className="button button--primary" onClick={onPaid}>
          {pay.paid}
          <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
