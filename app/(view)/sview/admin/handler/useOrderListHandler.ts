"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { orderListEvents, type ListQuery } from "../helper/adminHelper";
import { listOrders, type AdminOrderPage, type StatusFilter } from "../services/adminService";

/**
 * The order list's state. Searching, switching status and paging fetch the new page through a
 * Server Action and keep it here, so the page doesn't reload and the URL doesn't change. The
 * query (tab, search) updates at once; the results follow when they arrive, with `pending` true
 * in between. A slow answer that's overtaken by a newer request is dropped.
 */
export const useOrderListHandler = (initial: { query: ListQuery; result: AdminOrderPage }) => {
  const [query, setQuery] = useState(initial.query);
  const [result, setResult] = useState(initial.result);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  /** Numbers each request, so only the latest one's answer is shown. */
  const latest = useRef(0);

  const load = (next: ListQuery) => {
    setQuery(next);
    setError("");
    window.dispatchEvent(new CustomEvent(orderListEvents.changed, { detail: next.status }));
    const request = ++latest.current;
    startTransition(async () => {
      const response = await listOrders(next.status, next.search, next.page);
      if (request !== latest.current) return;
      startTransition(() => {
        if (response.ok) setResult(response.list);
        else setError(response.error);
      });
    });
  };

  const selectStatus = (status: StatusFilter) => load({ status, search: query.search, page: 1 });
  const search = (text: string) => load({ status: query.status, search: text, page: 1 });
  const goToPage = (page: number) => load({ ...query, page });

  // Tell the sidebar which status shows, and switch when one of its links is clicked.
  const onSelect = useEffectEvent((event: Event) => selectStatus((event as CustomEvent<StatusFilter>).detail));
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(orderListEvents.changed, { detail: initial.query.status }));
    window.addEventListener(orderListEvents.select, onSelect);
    return () => window.removeEventListener(orderListEvents.select, onSelect);
  }, [initial.query.status]);

  return { query, result, error, pending, selectStatus, search, goToPage };
};
