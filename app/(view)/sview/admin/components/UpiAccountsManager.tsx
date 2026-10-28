"use client";

import { CircleAlert, CircleCheck, Pencil, Plus, Trash2 } from "lucide-react";
import FieldError from "@/components/common/FieldError";
import Modal from "@/components/common/Modal";
import { UPI_PAYEE_NAME_MAX, upiPage } from "../content/adminContent";
import { useUpiAccountsHandler } from "../handler/useUpiAccountsHandler";
import { formatIstShort } from "../helper/adminHelper";
import type { UpiAccountView } from "../services/adminService";

/** Every UPI account in a table: add, edit, make one active, or delete one that isn't. */
export default function UpiAccountsManager({ accounts: initial }: { accounts: UpiAccountView[] }) {
  const handler = useUpiAccountsHandler(initial);
  const { accounts, dialog, form, errors } = handler;
  const text = upiPage;
  const editing = dialog?.kind === "add" || dialog?.kind === "edit" ? dialog : null;
  const confirming = dialog?.kind === "activate" || dialog?.kind === "deactivate" || dialog?.kind === "delete" ? dialog : null;
  const confirmText =
    confirming &&
    (confirming.kind === "activate" ? text.confirmActivate : confirming.kind === "deactivate" ? text.confirmDeactivate : text.confirmDelete);
  // The account that takes payments now: turning another on switches it off.
  const current = accounts.find((account) => account.active);
  /** The accounts the confirmation affects, by role: the one it's about, and the one it switches off. */
  const affected = confirming
    ? [
        { label: text.change[confirming.kind], account: confirming.account },
        ...(confirming.kind === "activate" && current && current.id !== confirming.account.id ? [{ label: text.change.replaced, account: current }] : []),
      ]
    : [];
  // Editing the account that takes payments changes new orders straight away.
  const editingActive = dialog?.kind === "edit" && dialog.account.active;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="admin-page__title">{text.title}</h1>
          <p className="text-muted admin-page__lead">{text.lead}</p>
        </div>
        <div className="admin-page__tools">
          <button type="button" className="button button--primary" onClick={() => handler.open({ kind: "add" })}>
            <Plus className="icon icon--sm" strokeWidth={1.75} />
            {text.add}
          </button>
        </div>
      </header>

      {handler.notice && (
        <p className="review__message" role="status">
          <CircleCheck className="icon icon--sm" strokeWidth={1.75} />
          <span>{handler.notice}</span>
        </p>
      )}
      {accounts.length > 0 && !accounts.some((account) => account.active) && (
        <p className="form-error" role="alert">
          <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
          <span>{text.noneActive}</span>
        </p>
      )}

      {accounts.length === 0 ? (
        <p className="card text-muted">{text.empty}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table plans-admin__table">
            <thead>
              <tr>
                <th scope="col">{text.columns.upiId}</th>
                <th scope="col">{text.columns.payeeName}</th>
                <th scope="col">{text.columns.updated}</th>
                <th scope="col">{text.columns.status}</th>
                <th scope="col">
                  <span className="visually-hidden">{text.edit}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <th scope="row" className="mono">
                    {account.upiId}
                  </th>
                  <td>{account.payeeName}</td>
                  <td className="mono">{formatIstShort(account.updatedAt)}</td>
                  <td>
                    {/* Asks first either way: on switches off the current account, off pauses checkout. */}
                    <label className="plans-admin__switch">
                      <input
                        type="checkbox"
                        role="switch"
                        checked={account.active}
                        disabled={handler.submitting}
                        aria-label={text.switchLabel.replace("{upiId}", account.upiId)}
                        onChange={() => handler.open({ kind: account.active ? "deactivate" : "activate", account })}
                      />
                      <span aria-hidden="true">{account.active ? text.active : text.inactive}</span>
                    </label>
                  </td>
                  <td className="admin-table__number">
                    <div className="plans-admin__actions">
                      <button type="button" className="button button--secondary button--sm" onClick={() => handler.open({ kind: "edit", account })}>
                        <Pencil className="icon icon--sm" strokeWidth={1.75} />
                        {text.edit}
                      </button>
                      {!account.active && (
                        <button
                          type="button"
                          className="button button--secondary button--sm"
                          aria-label={`${text.delete} ${account.upiId}`}
                          onClick={() => handler.open({ kind: "delete", account })}
                        >
                          <Trash2 className="icon icon--sm" strokeWidth={1.75} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} onClose={handler.close} eyebrow={text.eyebrow} title={editing?.kind === "edit" ? text.form.editTitle : text.form.addTitle}>
        <form
          className="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            handler.submit();
          }}
        >
          <label className="field">
            <span className="field__label">{text.form.upiIdLabel}</span>
            <input
              className="input mono"
              value={form.upiId}
              placeholder={text.form.upiIdPlaceholder}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={errors.upiId ? true : undefined}
              aria-describedby="upi-id-error"
              onChange={(event) => handler.change("upiId", event.target.value)}
              data-autofocus
            />
            <span className="text-muted app-update__hint">{text.form.upiIdHint}</span>
            <FieldError id="upi-id-error" message={errors.upiId} />
          </label>

          <label className="field">
            <span className="field__label">{text.form.payeeNameLabel}</span>
            <input
              className="input"
              value={form.payeeName}
              maxLength={UPI_PAYEE_NAME_MAX}
              placeholder={text.form.payeeNamePlaceholder}
              autoComplete="off"
              aria-invalid={errors.payeeName ? true : undefined}
              aria-describedby="upi-payee-error"
              onChange={(event) => handler.change("payeeName", event.target.value)}
            />
            <span className="text-muted app-update__hint">{text.form.payeeNameHint}</span>
            <FieldError id="upi-payee-error" message={errors.payeeName} />
          </label>

          {editingActive && (
            <p className="review__message review__message--warning" role="note">
              <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
              <span>{text.form.activeWarning}</span>
            </p>
          )}

          {handler.error && (
            <p className="form-error" role="alert">
              <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
              <span>{handler.error}</span>
            </p>
          )}
          <div className="review__buttons">
            <button type="button" className="button button--secondary" onClick={handler.close} disabled={handler.submitting}>
              {text.form.cancel}
            </button>
            <button type="submit" className="button button--primary" disabled={handler.submitting}>
              {handler.submitting ? text.form.saving : text.form.save}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirming !== null}
        onClose={handler.close}
        eyebrow={text.eyebrow}
        title={confirmText?.title ?? ""}
        description={confirmText?.description}
      >
        <div className="form">
          <dl className="upi-admin__change">
            {affected.map(({ label, account }) => (
              <div key={account.id} className="upi-admin__change-row">
                <dt>{label}</dt>
                <dd>
                  <span className="mono upi-admin__upi-id">{account.upiId}</span>
                  <span className="text-muted">{account.payeeName}</span>
                </dd>
              </div>
            ))}
          </dl>
          {handler.error && (
            <p className="form-error" role="alert">
              <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
              <span>{handler.error}</span>
            </p>
          )}
          <div className="review__buttons">
            <button type="button" className="button button--secondary" onClick={handler.close} disabled={handler.submitting}>
              {confirmText?.cancel}
            </button>
            <button type="button" className="button button--primary" onClick={handler.confirm} disabled={handler.submitting} data-autofocus>
              {handler.submitting ? text.form.saving : confirmText?.action}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
