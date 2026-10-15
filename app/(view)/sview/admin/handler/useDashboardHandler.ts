"use client";

import { useRef, useState, useTransition } from "react";
import { loadDashboard, type AdminDashboard, type DashboardRange } from "../services/adminService";

/**
 * The dashboard's state. Changing the period fetches its figures through a Server Action and keeps
 * them here, so the page doesn't reload and the URL doesn't change. The picker updates at once;
 * the figures follow, with `pending` true in between. A slow answer overtaken by a newer one is dropped.
 */
export const useDashboardHandler = (initial: AdminDashboard) => {
  const [range, setRange] = useState(initial.range);
  const [data, setData] = useState(initial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  /** Numbers each request, so only the latest one's answer is shown. */
  const latest = useRef(0);

  const selectRange = (next: DashboardRange) => {
    if (next === range && !error) return;
    setRange(next);
    setError("");
    const request = ++latest.current;
    startTransition(async () => {
      const response = await loadDashboard(next);
      if (request !== latest.current) return;
      startTransition(() => {
        if (response.ok) setData(response.dashboard);
        else setError(response.error);
      });
    });
  };

  return { range, data, error, pending, selectRange };
};
