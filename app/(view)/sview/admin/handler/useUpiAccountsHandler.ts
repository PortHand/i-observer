"use client";

import { useState } from "react";
import { upiPage } from "../content/adminContent";
import { parseUpiAccountForm, type UpiAccountField, type UpiAccountInput } from "../helper/upiHelper";
import { deleteUpiAccount, saveUpiAccount, setUpiAccountActive, type UpiAccountView, type UpiAccountsResult } from "../services/adminService";

/** What the open dialog does: add or edit an account, or confirm turning one on or off, or deleting it. */
export type UpiDialog =
  | { kind: "add" }
  | { kind: "edit"; account: UpiAccountView }
  | { kind: "activate"; account: UpiAccountView }
  | { kind: "deactivate"; account: UpiAccountView }
  | { kind: "delete"; account: UpiAccountView };

export const useUpiAccountsHandler = (initial: UpiAccountView[]) => {
  const [accounts, setAccounts] = useState(initial);
  const [dialog, setDialog] = useState<UpiDialog | null>(null);
  const [form, setForm] = useState<UpiAccountInput>({ upiId: "", payeeName: "", active: false });
  const [errors, setErrors] = useState<Partial<Record<UpiAccountField, string>>>({});
  /** A failure inside the open dialog. */
  const [error, setError] = useState("");
  /** The last change, shown above the table. */
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const open = (next: UpiDialog) => {
    // The table's switch turns accounts on and off; the form only changes the UPI ID and name. The
    // first account is the exception: it's made active, or checkout would have none to pay.
    setForm(
      next.kind === "add"
        ? { upiId: "", payeeName: "", active: accounts.length === 0 }
        : next.kind === "edit"
          ? { upiId: next.account.upiId, payeeName: next.account.payeeName, active: false }
          : form,
    );
    setErrors({});
    setError("");
    setDialog(next);
  };

  const close = () => {
    if (!submitting) setDialog(null);
  };

  const change = <K extends keyof UpiAccountInput>(field: K, value: UpiAccountInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  /** Runs a change, then shows every account as saved and `done` above the table. */
  const run = async (call: () => Promise<UpiAccountsResult>, done: string) => {
    setSubmitting(true);
    setError("");
    try {
      const result = await call();
      if (!result.ok) {
        setErrors(result.fields ?? {});
        if (!result.fields) setError(result.error);
        return;
      }
      setAccounts(result.accounts);
      setNotice(done);
      setDialog(null);
    } finally {
      setSubmitting(false);
    }
  };

  const submit = () => {
    if (dialog?.kind !== "add" && dialog?.kind !== "edit") return;
    const parsed = parseUpiAccountForm(form);
    if (!parsed.ok) return setErrors(parsed.errors);
    const id = dialog.kind === "edit" ? dialog.account.id : null;
    void run(() => saveUpiAccount(id, parsed.input), upiPage.saved.replace("{upiId}", parsed.input.upiId));
  };

  const confirm = () => {
    if (dialog?.kind === "activate")
      void run(() => setUpiAccountActive(dialog.account.id, true), upiPage.activated.replace("{upiId}", dialog.account.upiId));
    if (dialog?.kind === "deactivate")
      void run(() => setUpiAccountActive(dialog.account.id, false), upiPage.deactivated.replace("{upiId}", dialog.account.upiId));
    if (dialog?.kind === "delete") void run(() => deleteUpiAccount(dialog.account.id), upiPage.deleted.replace("{upiId}", dialog.account.upiId));
  };

  return { accounts, dialog, form, errors, error, notice, submitting, open, close, change, submit, confirm };
};
