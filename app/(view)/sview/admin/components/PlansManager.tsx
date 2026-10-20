"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleAlert, CircleCheck, Pencil, Plus } from "lucide-react";
import { formatAmount } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { adminNewPlanLink, adminPlanLink } from "@/helper/route";
import { MAX_PLANS_ON_SALE, plansPage } from "../content/adminContent";
import { savedPlanParam } from "../handler/usePlanFormHandler";
import { formatIst, formatIstShort } from "../helper/adminHelper";
import { previewDiscount } from "../helper/planHelper";
import type { AdminPlanStatus, AdminPlanView, PlanToggleResult } from "../services/adminService";
import PlanActiveSwitch from "./PlanActiveSwitch";

export const planStatusBadge: Record<AdminPlanStatus, string> = {
  onSale: "badge badge--verified",
  scheduled: "badge badge--submitted",
  noPrice: "badge badge--rejected",
  off: "badge badge--pending",
};

/** Every plan in a table, each with an on/off switch; each opens its own page to edit. */
export default function PlansManager({ plans: initial }: { plans: AdminPlanView[] }) {
  const [plans, setPlans] = useState(initial);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  // Set by the plan page after a save; replaced by the switches' own messages once one is used.
  const saved = useSearchParams().get(savedPlanParam);
  const activeCount = plans.filter((plan) => plan.active).length;

  const onToggled = (plan: AdminPlanView) => (result: PlanToggleResult, active: boolean) => {
    if (!result.ok) return setNotice({ ok: false, text: result.error });
    setPlans(result.plans);
    setNotice({ ok: true, text: (active ? plansPage.turnedOn : plansPage.turnedOff).replace("{plan}", plan.name) });
  };

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="eyebrow">{plansPage.eyebrow}</span>
          <h1 className="admin-page__title">{plansPage.title}</h1>
          <p className="text-muted admin-page__lead">{plansPage.lead}</p>
        </div>
        <div className="admin-page__tools">
          <Link href={adminNewPlanLink} className="button button--primary">
            <Plus className="icon icon--sm" strokeWidth={1.75} />
            {plansPage.add}
          </Link>
          <p className="admin-page__meta mono">{plansPage.onSaleCount.replace("{count}", String(activeCount))}</p>
          {activeCount >= MAX_PLANS_ON_SALE && <p className="text-muted plans-admin__hint">{plansPage.addFull}</p>}
        </div>
      </header>

      {notice ? (
        notice.ok ? (
          <p className="review__message" role="status">
            <CircleCheck className="icon icon--sm" strokeWidth={1.75} />
            <span>{notice.text}</span>
          </p>
        ) : (
          <p className="form-error" role="alert">
            <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
            <span>{notice.text}</span>
          </p>
        )
      ) : (
        saved && (
          <p className="review__message" role="status">
            <CircleCheck className="icon icon--sm" strokeWidth={1.75} />
            <span>{plansPage.saved.replace("{plan}", saved)}</span>
          </p>
        )
      )}

      {plans.length === 0 ? (
        <p className="card text-muted">{plansPage.empty}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table plans-admin__table">
            <thead>
              <tr>
                <th scope="col">{plansPage.columns.plan}</th>
                <th scope="col">{plansPage.columns.price}</th>
                <th scope="col">{plansPage.columns.rules}</th>
                <th scope="col">{plansPage.columns.status}</th>
                <th scope="col">
                  <span className="visually-hidden">{plansPage.edit}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <PlanRow key={plan.id} plan={plan} onToggled={onToggled(plan)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PlanRow({ plan, onToggled }: { plan: AdminPlanView; onToggled: (result: PlanToggleResult, active: boolean) => void }) {
  const percent = plan.price !== null && plan.compareAtPrice !== null ? previewDiscount(String(plan.price), String(plan.compareAtPrice)) : null;
  const rules = [
    plan.durationMonths !== null
      ? plansPage.months(plan.durationMonths)
      : plan.durationHours !== null
        ? plansPage.hours(plan.durationHours)
        : plansPage.lifetime,
    plansPage.maxPerOrder(plan.maxQuantity),
  ];
  const saleWindow = [plan.availableFrom && `≥ ${formatIstShort(plan.availableFrom)}`, plan.availableUntil && `< ${formatIstShort(plan.availableUntil)}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <tr>
      <th scope="row">
        <span className="plans-admin__name">
          <Link href={adminPlanLink(plan.id)}>{plan.name}</Link>
          {plan.isDefault && <span className="plans-admin__tag">{plansPage.defaultTag}</span>}
          {plan.badge && <span className="plans-admin__tag plans-admin__tag--accent">{plan.badge}</span>}
        </span>
        <span className="text-muted plans-admin__sub plans-admin__id">
          {plan.id} · {plan.period}
        </span>
      </th>
      <td>
        {plan.price === null ? (
          <span className="text-muted">{plansPage.noPrice}</span>
        ) : (
          <span className="plans-admin__price">
            {plan.compareAtPrice !== null && <s className="text-muted">{formatAmount(plan.compareAtPrice)}</s>}
            <strong>{formatAmount(plan.price)}</strong>
            {percent !== null && <span className="plans-admin__off">{plansPage.off.replace("{percent}", String(percent))}</span>}
          </span>
        )}
        {plan.sale && (
          <span className="plans-admin__sub plans-admin__sale">
            {plansPage.saleRunning.replace("{price}", formatAmount(plan.sale.price)).replace("{date}", formatIst(plan.sale.until))}
          </span>
        )}
      </td>
      <td>
        <span className="plans-admin__sub">{rules.join(" · ")}</span>
        {saleWindow && <span className="plans-admin__sub plans-admin__id">{saleWindow}</span>}
      </td>
      <td>
        <span className={planStatusBadge[plan.status]}>{plansPage.status[plan.status]}</span>
      </td>
      <td className="admin-table__number">
        <div className="plans-admin__actions">
          <PlanActiveSwitch plan={plan} onResult={onToggled} />
          <Link href={adminPlanLink(plan.id)} className="button button--secondary button--sm">
            <Pencil className="icon icon--sm" strokeWidth={1.75} />
            {plansPage.edit}
          </Link>
        </div>
      </td>
    </tr>
  );
}
