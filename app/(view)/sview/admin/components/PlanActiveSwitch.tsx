"use client";

import { useState } from "react";
import { plansPage } from "../content/adminContent";
import { setPlanActive, type PlanToggleResult } from "../services/adminService";

interface PlanActiveSwitchProps {
  plan: { id: string; name: string; active: boolean };
  /** Called with the server's answer once the switch has saved (or failed), and the state it asked for. */
  onResult: (result: PlanToggleResult, active: boolean) => void;
}

/** Turns a plan on or off for sale straight away, without opening its form. */
export default function PlanActiveSwitch({ plan, onResult }: PlanActiveSwitchProps) {
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const active = !plan.active;
    setSaving(true);
    try {
      onResult(await setPlanActive(plan.id, active), active);
    } finally {
      setSaving(false);
    }
  };

  return (
    <label className="plans-admin__switch">
      <input
        type="checkbox"
        role="switch"
        checked={plan.active}
        disabled={saving}
        aria-busy={saving || undefined}
        aria-label={plansPage.toggle.label.replace("{plan}", plan.name)}
        onChange={() => void toggle()}
      />
      <span aria-hidden="true">{plan.active ? plansPage.toggle.on : plansPage.toggle.off}</span>
    </label>
  );
}
