"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import FieldError from "@/components/common/FieldError";
import Modal from "@/components/common/Modal";
import { APP_UPDATE_MESSAGE_MAX, appUpdate } from "../content/adminContent";
import { useAppUpdateHandler } from "../handler/useAppUpdateHandler";
import { formatIst } from "../helper/adminHelper";
import type { AppUpdatePolicyView } from "../services/adminService";

/** The forced-update policy: a switch, the minimum version and the message users see. */
export default function AppUpdateForm({ initial, latestVersion }: { initial: AppUpdatePolicyView; latestVersion: string }) {
  const handler = useAppUpdateHandler(initial, latestVersion);
  const { saved, form, errors } = handler;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="eyebrow">{appUpdate.eyebrow}</span>
          <h1 className="admin-page__title">{appUpdate.title}</h1>
          <p className="text-muted admin-page__lead">{appUpdate.lead}</p>
        </div>
        <div className="admin-page__tools">
          <p className={`app-update__status${saved.forceUpdate ? " app-update__status--on" : ""}`} role="status">
            {saved.forceUpdate ? appUpdate.status.on.replace("{version}", saved.minimumVersion) : appUpdate.status.off}
          </p>
          <p className="admin-page__meta mono">
            {saved.updatedAt
              ? appUpdate.updated.replace("{date}", formatIst(saved.updatedAt)).replace("{admin}", saved.updatedBy ?? "—")
              : appUpdate.neverSaved}
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
            <input
              type="checkbox"
              role="switch"
              checked={form.forceUpdate}
              onChange={(event) => handler.change("forceUpdate", event.target.checked)}
            />
            <span className="app-update__switch-text">
              <span className="field__label">{appUpdate.forceLabel}</span>
              <span className="text-muted app-update__hint">{appUpdate.forceHint}</span>
            </span>
          </label>

          <label className="field">
            <span className="field__label">{appUpdate.versionLabel}</span>
            <input
              className="input mono app-update__version"
              value={form.minimumVersion}
              placeholder={appUpdate.versionPlaceholder}
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={errors.minimumVersion ? true : undefined}
              aria-describedby="app-update-version-error"
              onChange={(event) => handler.change("minimumVersion", event.target.value)}
            />
            <span className="text-muted app-update__hint">
              {appUpdate.versionHint} {appUpdate.latest.replace("{version}", latestVersion)}
            </span>
            <FieldError id="app-update-version-error" message={errors.minimumVersion} />
          </label>

          <label className="field">
            <span className="field__label">{appUpdate.messageLabel}</span>
            <textarea
              className="input textarea"
              rows={3}
              maxLength={APP_UPDATE_MESSAGE_MAX}
              value={form.message}
              placeholder={appUpdate.messagePlaceholder}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby="app-update-message-error"
              onChange={(event) => handler.change("message", event.target.value)}
            />
            <span className="text-muted app-update__hint">{appUpdate.messageHint}</span>
            <FieldError id="app-update-message-error" message={errors.message} />
          </label>

          {handler.error && (
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
            <button type="submit" className="button button--primary" disabled={handler.submitting}>
              {handler.submitting && !handler.confirming ? appUpdate.saving : appUpdate.save}
            </button>
          </div>
        </form>
      </section>

      <Modal
        open={handler.confirming}
        onClose={handler.cancel}
        eyebrow={appUpdate.eyebrow}
        title={appUpdate.confirm.title}
        description={appUpdate.confirm.description.replace("{version}", form.minimumVersion.trim())}
      >
        <div className="form">
          {handler.error && (
            <p className="form-error" role="alert">
              <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
              <span>{handler.error}</span>
            </p>
          )}
          <div className="review__buttons">
            <button type="button" className="button button--secondary" onClick={handler.cancel} disabled={handler.submitting}>
              {appUpdate.confirm.cancel}
            </button>
            <button type="button" className="button button--primary" onClick={() => void handler.save()} disabled={handler.submitting} data-autofocus>
              {handler.submitting ? appUpdate.saving : appUpdate.confirm.action}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
