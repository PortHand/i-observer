"use client";

import { CircleAlert, CircleCheck, RotateCcw } from "lucide-react";
import DateTimePicker from "@/components/common/DateTimePicker";
import FieldError from "@/components/common/FieldError";
import Modal from "@/components/common/Modal";
import { OFFER_HEADLINE_MAX, OFFER_TIMER_MAX_HOURS, offerTimerPage } from "../content/adminContent";
import { useOfferTimerHandler } from "../handler/useOfferTimerHandler";
import { formatIst } from "../helper/adminHelper";
import type { OfferTimerView } from "../services/adminService";

/** One-line summary of what customers see now. */
const statusText = (timer: OfferTimerView) => {
  const { status } = offerTimerPage;
  if (!timer.enabled) return status.off;
  if (!timer.nextEndsAt) return status.ended;
  const date = formatIst(timer.nextEndsAt);
  return timer.autoRestart ? status.restarting.replace("{date}", date).replace("{hours}", String(timer.durationHours)) : status.on.replace("{date}", date);
};

/** The offer countdown: a switch, its headline, when it ends, its length and whether it restarts. */
export default function OfferTimerForm({ initial }: { initial: OfferTimerView }) {
  const handler = useOfferTimerHandler(initial);
  const { saved, form, errors } = handler;
  const text = offerTimerPage;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="admin-page__title">{text.title}</h1>
          <p className="text-muted admin-page__lead">{text.lead}</p>
        </div>
        <div className="admin-page__tools">
          <p className={`app-update__status${saved.enabled && saved.nextEndsAt ? " app-update__status--on" : ""}`} role="status">
            {statusText(saved)}
          </p>
          <p className="admin-page__meta mono">
            {saved.updatedAt ? text.updated.replace("{date}", formatIst(saved.updatedAt)).replace("{admin}", saved.updatedBy ?? "—") : text.neverSaved}
          </p>
        </div>
      </header>

      <section className="card app-update">
        <form
          className="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            handler.submit();
          }}
        >
          <label className="app-update__switch">
            <input type="checkbox" role="switch" checked={form.enabled} onChange={(event) => handler.change("enabled", event.target.checked)} />
            <span className="app-update__switch-text">
              <span className="field__label">{text.enabledLabel}</span>
              <span className="text-muted app-update__hint">{text.enabledHint}</span>
            </span>
          </label>

          <label className="field">
            <span className="field__label">{text.headlineLabel}</span>
            <input
              className="input"
              value={form.headline}
              maxLength={OFFER_HEADLINE_MAX}
              placeholder={text.headlinePlaceholder}
              autoComplete="off"
              aria-invalid={errors.headline ? true : undefined}
              aria-describedby="offer-headline-error"
              onChange={(event) => handler.change("headline", event.target.value)}
            />
            <span className="text-muted app-update__hint">{text.headlineHint}</span>
            <FieldError id="offer-headline-error" message={errors.headline} />
          </label>

          <div className="offer-timer-admin__row">
            {/* A <div>, not a <label>: clicks inside the open calendar mustn't reach the trigger. */}
            <div className="field">
              <span id="offer-ends-label" className="field__label">
                {text.endsAtLabel}
              </span>
              <DateTimePicker
                value={form.endsAt}
                onChange={(value) => handler.change("endsAt", value)}
                labelledBy="offer-ends-label"
                describedBy="offer-ends-hint offer-ends-error"
                invalid={Boolean(errors.endsAt)}
                placeholder={text.endsAtPlaceholder}
                zoneLabel="IST"
              />
              <span id="offer-ends-hint" className="text-muted app-update__hint">
                {text.endsAtHint}
              </span>
              <FieldError id="offer-ends-error" message={errors.endsAt} />
            </div>

            <label className="field">
              <span className="field__label">{text.hoursLabel}</span>
              <input
                className="input mono app-update__version"
                type="number"
                min={1}
                max={OFFER_TIMER_MAX_HOURS}
                step={1}
                inputMode="numeric"
                value={form.durationHours}
                aria-invalid={errors.durationHours ? true : undefined}
                aria-describedby="offer-hours-error"
                onChange={(event) => handler.change("durationHours", event.target.value)}
              />
              <span className="text-muted app-update__hint">{text.hoursHint}</span>
              <FieldError id="offer-hours-error" message={errors.durationHours} />
            </label>
          </div>

          <label className="app-update__switch">
            <input type="checkbox" checked={form.autoRestart} onChange={(event) => handler.change("autoRestart", event.target.checked)} />
            <span className="app-update__switch-text">
              <span className="field__label">{text.restartLabel}</span>
              <span className="text-muted app-update__hint">{text.restartHint}</span>
            </span>
          </label>

          {handler.error && !handler.confirmingReset && (
            <p className="form-error" role="alert">
              <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
              <span>{handler.error}</span>
            </p>
          )}
          {handler.message && (
            <p className="review__message" role="status">
              <CircleCheck className="icon icon--sm" strokeWidth={1.75} />
              <span>{handler.message}</span>
            </p>
          )}
          <div className="review__buttons">
            <button type="button" className="button button--secondary" onClick={handler.askReset} disabled={handler.submitting}>
              <RotateCcw className="icon icon--sm" strokeWidth={1.75} />
              {text.reset}
            </button>
            <button type="submit" className="button button--primary" disabled={handler.submitting}>
              {handler.submitting && !handler.confirmingReset ? text.saving : text.save}
            </button>
          </div>
        </form>
      </section>

      <Modal
        open={handler.confirmingReset}
        onClose={handler.cancelReset}
        eyebrow={text.eyebrow}
        title={text.confirmReset.title}
        description={text.confirmReset.description.replace("{hours}", form.durationHours.trim())}
      >
        <div className="form">
          {handler.error && (
            <p className="form-error" role="alert">
              <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
              <span>{handler.error}</span>
            </p>
          )}
          <div className="review__buttons">
            <button type="button" className="button button--secondary" onClick={handler.cancelReset} disabled={handler.submitting}>
              {text.confirmReset.cancel}
            </button>
            <button type="button" className="button button--primary" onClick={() => void handler.reset()} disabled={handler.submitting} data-autofocus>
              {handler.submitting ? text.saving : text.confirmReset.action}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
