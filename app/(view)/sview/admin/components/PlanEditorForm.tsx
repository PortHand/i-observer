"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CircleAlert, CircleCheck, Info } from "lucide-react";
import FieldError from "@/components/common/FieldError";
import { formatAmount } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { routes } from "@/helper/route";
import { plansPage } from "../content/adminContent";
import { usePlanFormHandler } from "../handler/usePlanFormHandler";
import { formatIst } from "../helper/adminHelper";
import { DURATION_UNITS, PLAN_TEXT_MAX, previewDiscount, type PlanField, type PlanInput } from "../helper/planHelper";
import type { AdminPlanView, PlanToggleResult } from "../services/adminService";
import PlanActiveSwitch from "./PlanActiveSwitch";
import { planStatusBadge } from "./PlansManager";

type TextField = Exclude<PlanField, "isDefault" | "active" | "durationUnit">;

interface FieldOptions {
  hint?: string;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
  type?: string;
  maxLength?: number;
  /** Ids and amounts: monospaced, never uppercased. */
  mono?: boolean;
  disabled?: boolean;
}

const rupees = (value: string) => Number(value.replace(/,/g, ""));

/** One plan's page: its details, price and rules on the left, a preview of its pricing card on the right. */
export default function PlanEditorForm({ plan: loaded, initial }: { plan: AdminPlanView | null; initial: PlanInput }) {
  // The header's switch saves straight away, so the plan's status is kept here as it changes.
  const [plan, setPlan] = useState(loaded);
  const [toggleNotice, setToggleNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const isNew = plan === null;
  const { form, change, errors, error, submitting, submit } = usePlanFormHandler(initial, isNew);

  const onToggled = (result: PlanToggleResult, active: boolean) => {
    if (!result.ok) return setToggleNotice({ ok: false, text: result.error });
    const updated = result.plans.find((row) => row.id === plan?.id);
    if (updated) setPlan(updated);
    // Keep the form in step, so saving it later doesn't switch the plan back.
    change("active", active);
    setToggleNotice({ ok: true, text: (active ? plansPage.turnedOn : plansPage.turnedOff).replace("{plan}", updated?.name ?? "") });
  };
  const { form: text } = plansPage;
  const percent = previewDiscount(form.price, form.compareAtPrice);

  const field = (name: TextField, label: string, options: FieldOptions = {}) => {
    const describedBy = options.hint ? `plan-${name}-hint plan-${name}-error` : `plan-${name}-error`;
    return (
      <label className="field plan-editor__field">
        <span className="field__label">{label}</span>
        <input
          className={`input${options.mono ? " mono-input" : ""}`}
          type={options.type ?? "text"}
          value={form[name]}
          placeholder={options.placeholder}
          inputMode={options.inputMode}
          maxLength={options.maxLength}
          disabled={options.disabled}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={errors[name] ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => change(name, event.target.value)}
        />
        <FieldError id={`plan-${name}-error`} message={errors[name]} />
        {options.hint && (
          <span id={`plan-${name}-hint`} className="plan-editor__hint">
            {options.hint}
          </span>
        )}
      </label>
    );
  };

  const toggle = (name: "active" | "isDefault", label: string, hint: string) => (
    <label className="app-update__switch">
      <input type="checkbox" role="switch" checked={form[name]} onChange={(event) => change(name, event.target.checked)} />
      <span className="app-update__switch-text">
        <span className="field__label">{label}</span>
        <span className="plan-editor__hint">{hint}</span>
        <FieldError id={`plan-${name}-error`} message={errors[name]} />
      </span>
    </label>
  );

  const section = (title: string, lead: string, children: ReactNode) => (
    <section className="card plan-editor__section">
      <header className="plan-editor__section-head">
        <h2 className="eyebrow">{title}</h2>
        <p className="plan-editor__hint">{lead}</p>
      </header>
      {children}
    </section>
  );

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <Link className="admin-back mono" href={routes.adminPlans}>
            <ArrowLeft className="icon icon--sm" strokeWidth={1.75} />
            {text.back}
          </Link>
          <h1 className="admin-page__title">{isNew ? text.newTitle : text.editTitle.replace("{plan}", plan.name)}</h1>
          {!isNew && <p className="admin-page__meta mono">{plan.id}</p>}
        </div>
        {!isNew && (
          <div className="admin-page__tools">
            <div className="plans-admin__actions">
              <PlanActiveSwitch plan={plan} onResult={onToggled} />
              <span className={planStatusBadge[plan.status]}>{plansPage.status[plan.status]}</span>
            </div>
          </div>
        )}
      </header>

      {toggleNotice &&
        (toggleNotice.ok ? (
          <p className="review__message" role="status">
            <CircleCheck className="icon icon--sm" strokeWidth={1.75} />
            <span>{toggleNotice.text}</span>
          </p>
        ) : (
          <p className="form-error" role="alert">
            <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
            <span>{toggleNotice.text}</span>
          </p>
        ))}

      <form
        className="plan-editor"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="plan-editor__main">
          {section(
            text.details,
            text.detailsLead,
            <>
              <div className="plan-editor__grid">
                {field("id", text.idLabel, { hint: text.idHint, placeholder: "two-years", mono: true, maxLength: 32, disabled: !isNew })}
                {field("name", text.nameLabel, { placeholder: text.namePlaceholder, maxLength: PLAN_TEXT_MAX.name })}
                {field("period", text.periodLabel, { placeholder: text.periodPlaceholder, maxLength: PLAN_TEXT_MAX.period })}
                {field("badge", text.badgeLabel, { placeholder: text.badgePlaceholder, maxLength: PLAN_TEXT_MAX.badge })}
              </div>
              <label className="field plan-editor__field">
                <span className="field__label">{text.descriptionLabel}</span>
                <textarea
                  className="input textarea"
                  rows={3}
                  maxLength={PLAN_TEXT_MAX.description}
                  value={form.description}
                  placeholder={text.descriptionPlaceholder}
                  aria-invalid={errors.description ? true : undefined}
                  aria-describedby="plan-description-error"
                  onChange={(event) => change("description", event.target.value)}
                />
                <FieldError id="plan-description-error" message={errors.description} />
              </label>
            </>,
          )}

          {section(
            text.price,
            text.priceHint,
            <>
              <div className="plan-editor__grid">
                {field("price", text.priceLabel, { placeholder: "2799", inputMode: "decimal", mono: true, hint: text.priceZeroHint })}
                {field("compareAtPrice", text.compareAtLabel, { placeholder: "3999", inputMode: "decimal", mono: true, hint: text.compareAtHint })}
              </div>
              {plan?.sale && (
                <p className="review__message review__message--warning">
                  <Info className="icon icon--sm" strokeWidth={1.75} />
                  <span>{plansPage.saleRunning.replace("{price}", formatAmount(plan.sale.price)).replace("{date}", formatIst(plan.sale.until))}</span>
                </p>
              )}
            </>,
          )}

          {section(
            text.rules,
            text.rulesLead,
            <>
              <div className="plan-editor__grid">
                <div className="field plan-editor__field">
                  <span className="field__label" id="plan-duration-unit-label">
                    {text.durationUnitLabel}
                  </span>
                  <div className="segmented mono plan-editor__units" role="group" aria-labelledby="plan-duration-unit-label">
                    {DURATION_UNITS.map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        className="segmented__option"
                        aria-pressed={form.durationUnit === unit}
                        onClick={() => {
                          change("durationUnit", unit);
                          // A lifetime plan bought twice gives nothing more.
                          if (unit === "lifetime") change("maxQuantity", "1");
                        }}
                      >
                        {text.durationUnits[unit]}
                      </button>
                    ))}
                  </div>
                  {form.durationUnit === "lifetime" && <span className="plan-editor__hint">{text.durationHint.lifetime}</span>}
                </div>
                {form.durationUnit !== "lifetime" &&
                  field("duration", text.durationLabel[form.durationUnit], {
                    hint: text.durationHint[form.durationUnit],
                    inputMode: "numeric",
                    mono: true,
                    placeholder: form.durationUnit === "hours" ? "2" : "12",
                  })}
              </div>
              <div className="plan-editor__grid">
                {field("maxQuantity", text.maxQuantityLabel, { hint: text.maxQuantityHint, inputMode: "numeric", mono: true })}
                {field("sortOrder", text.sortLabel, { hint: text.sortHint, inputMode: "numeric", mono: true })}
              </div>
              <div className="plan-editor__grid">
                {field("availableFrom", text.fromLabel, { type: "datetime-local", hint: text.windowHint })}
                {field("availableUntil", text.untilLabel, { type: "datetime-local" })}
              </div>
              <div className="plan-editor__grid">
                {/* An existing plan is switched on and off from the header, which saves straight away. */}
                {isNew && toggle("active", text.activeLabel, text.activeHint)}
                {toggle("isDefault", text.defaultLabel, text.defaultHint)}
              </div>
            </>,
          )}

          <div className="plan-editor__actions">
            {error && (
              <p className="form-error" role="alert">
                <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
                <span>{error}</span>
              </p>
            )}
            <div className="review__buttons">
              <button type="submit" className="button button--primary" disabled={submitting}>
                {submitting ? text.saving : isNew ? text.create : text.save}
              </button>
              <Link href={routes.adminPlans} className="button button--secondary" aria-disabled={submitting || undefined}>
                {text.cancel}
              </Link>
            </div>
          </div>
        </div>

        <aside className="plan-editor__aside" aria-label={text.previewTitle}>
          <p className="eyebrow">{text.previewTitle}</p>
          <article className={form.isDefault ? "plan plan--highlighted theme-ink plan-editor__card" : "plan plan-editor__card"}>
            <div className="plan__header">
              <h3 className="plan__name">{form.name.trim() || text.namePlaceholder}</h3>
              {form.badge.trim() && <span className="plan__badge">{form.badge.trim()}</span>}
            </div>
            {percent !== null && (
              <p className="plan__compare">
                <s className="plan__was">{formatAmount(rupees(form.compareAtPrice))}</s>
                <span className="plan__off">{plansPage.off.replace("{percent}", String(percent))}</span>
              </p>
            )}
            <p className="plan__price">
              {form.price.trim() !== "" && rupees(form.price) >= 0 ? formatAmount(rupees(form.price)) : "₹—"}
              <span className="plan__period">{form.period.trim() || text.periodPlaceholder}</span>
            </p>
            <p className="plan__description">{form.description.trim() || text.descriptionPlaceholder}</p>
          </article>
          <p className="plan-editor__hint">{text.previewHint}</p>
        </aside>
      </form>
    </div>
  );
}
