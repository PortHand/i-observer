"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/helper/route";
import { parsePlanForm, type PlanField, type PlanInput } from "../helper/planHelper";
import { savePlan } from "../services/adminService";

/** Query parameter on the plans list: the name of the plan just saved, for the confirmation. */
export const savedPlanParam = "saved";

export const usePlanFormHandler = (initial: PlanInput, isNew: boolean) => {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<PlanField, string>>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const change = <K extends keyof PlanInput>(field: K, value: PlanInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  };

  /** Saves, then goes back to the list, which confirms the save. */
  const submit = async () => {
    const parsed = parsePlanForm(form);
    if (!parsed.ok) return setErrors(parsed.errors);
    setSubmitting(true);
    setError("");
    let saved = false;
    try {
      const result = await savePlan(form, isNew);
      if (!result.ok) {
        setErrors(result.fields ?? {});
        setError(result.error);
        return;
      }
      saved = true;
      router.push(`${routes.adminPlans}?${new URLSearchParams({ [savedPlanParam]: parsed.change.name })}`);
    } finally {
      // After a save the button keeps saying "Saving…" while the list loads.
      if (!saved) setSubmitting(false);
    }
  };

  return { form, change, errors, error, submitting, submit };
};
