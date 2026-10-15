"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import Modal from "@/components/common/Modal";
import { actions, review } from "../content/adminContent";
import { useReviewHandler } from "../handler/useReviewHandler";
import type { ReviewAction } from "../services/adminService";

/** The review buttons for an order, each confirmed in a dialog with an optional note. */
export default function ReviewPanel({ reference, available }: { reference: string; available: ReviewAction[] }) {
  const handler = useReviewHandler(reference);
  const current = handler.action ? actions[handler.action] : null;

  return (
    <div className="review">
      {handler.message && (
        <p className={`review__message${handler.warning ? " review__message--warning" : ""}`} role="status">
          {handler.warning ? <CircleAlert className="icon icon--sm" strokeWidth={1.75} /> : <CircleCheck className="icon icon--sm" strokeWidth={1.75} />}
          <span>{handler.message}</span>
        </p>
      )}
      {available.length > 0 && (
        <div className="review__buttons">
          {available.map((id) => (
            <button key={id} type="button" className={`button button--${actions[id].tone}`} onClick={() => handler.open(id)}>
              {actions[id].label}
            </button>
          ))}
        </div>
      )}

      <Modal open={current !== null} onClose={handler.close} eyebrow={reference} title={current?.title} description={current?.description}>
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void handler.confirm();
          }}
        >
          {handler.action !== "resend" && (
            <label className="field">
              <span className="field__label">{review.noteLabel}</span>
              <textarea
                className="input textarea"
                rows={3}
                maxLength={500}
                value={handler.note}
                placeholder={review.notePlaceholder}
                onChange={(event) => handler.setNote(event.target.value)}
                data-autofocus
              />
            </label>
          )}
          {handler.error && (
            <p className="form-error" role="alert">
              <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
              <span>{handler.error}</span>
            </p>
          )}
          <div className="review__buttons">
            <button type="button" className="button button--secondary" onClick={handler.close} disabled={handler.submitting}>
              {review.cancel}
            </button>
            <button type="submit" className={`button button--${current?.tone ?? "primary"}`} disabled={handler.submitting}>
              {current?.confirm}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
