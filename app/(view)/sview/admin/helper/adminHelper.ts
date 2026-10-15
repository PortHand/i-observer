import { routes } from "@/helper/route";
import { payment } from "@/app/(view)/(pview)/get-ioverlay/content/getContent";
import { statusTabs } from "../content/adminContent";
import { DASHBOARD_RANGES, type DashboardRange, type StatusFilter } from "../services/adminService";

export interface ListQuery {
  status: StatusFilter;
  search: string;
  page: number;
}

/** Search text longer than this is cut, so a pasted essay can't become a huge query. */
const MAX_SEARCH = 100;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads ?status=&q=&page= from the URL. Unknown values fall back to "Needs review", page 1. */
export const parseListQuery = (params: Record<string, string | string[] | undefined>): ListQuery => {
  const status = first(params.status);
  const page = Number.parseInt(first(params.page), 10);
  return {
    status: statusTabs.some((tab) => tab.id === status) ? (status as StatusFilter) : "submitted",
    search: first(params.q).trim().slice(0, MAX_SEARCH),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
};

/**
 * Window events that keep the sidebar and the order list in step without touching the URL: the
 * list announces the status it shows (`changed`), and the sidebar asks it to show one (`select`).
 * Both carry the StatusFilter as `detail`.
 */
export const orderListEvents = { changed: "admin:orders-status", select: "admin:orders-select" } as const;

/** The order list with these filters, leaving defaults out of the URL. */
export const ordersLink = ({ status, search, page }: Partial<ListQuery>) => {
  const query = new URLSearchParams();
  if (status && status !== "submitted") query.set("status", status);
  if (search) query.set("q", search);
  if (page && page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `${routes.adminOrders}?${text}` : routes.adminOrders;
};

/** Reads ?range= (days) for the dashboard. Unknown values fall back to 30 days. */
export const parseRange = (params: Record<string, string | string[] | undefined>): DashboardRange => {
  const days = Number(first(params.range));
  return DASHBOARD_RANGES.find((range) => range === days) ?? 30;
};

/** The dashboard over the last `range` days, leaving the default out of the URL. */
export const dashboardLink = (range: DashboardRange) => (range === 30 ? routes.admin : `${routes.admin}?range=${range}`);

/** Admins work in India, so times show in IST whatever the server's time zone. */
export const formatIst = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(iso));

/** Compact IST date and time for tables: "15 Oct, 2:24 pm". */
export const formatIstShort = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(iso));

/** How long ago `iso` was, roughly: "5 min", "3 h", "2 days". */
export const formatAge = (iso: string, now = Date.now()) => {
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.round(hours / 24)} days`;
};

/** "1 order" or "12 orders". */
export const orderCount = (count: number, text: { one: string; many: string }) =>
  count === 1 ? text.one : text.many.replace("{count}", String(count));

/** Change from `previous` to `current` as a fraction (0.25 is +25%), or null when there's nothing to compare with. */
export const change = (current: number, previous: number) => (previous === 0 ? null : (current - previous) / previous);

/** "+25%", "−8%", "0%". */
export const formatChange = (fraction: number) => {
  const percent = Math.round(fraction * 100);
  return `${percent > 0 ? "+" : percent < 0 ? "−" : ""}${Math.abs(percent)}%`;
};

/** "64%", or "" with nothing to divide by. */
export const formatPercent = (part: number, whole: number) => (whole === 0 ? "" : `${Math.round((part / whole) * 100)}%`);

/** A duration in seconds, roughly: "45 min", "3.5 h", "2 days". */
export const formatDuration = (seconds: number) => {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${hours < 10 ? Math.round(hours * 10) / 10 : Math.round(hours)} h`;
  return `${Math.round(hours / 24)} days`;
};

/** Short money for chart axes: "₹0", "₹1.2K", "₹3.4L". */
export const formatCompactAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: payment.currency, notation: "compact", maximumFractionDigits: 1 }).format(amount);

/** "15 Oct" for an IST day key ("2026-10-15"). */
export const formatDay = (day: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));

/** Time of day in IST: "4:05 pm". */
export const formatIstTime = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(iso));

/** A round axis maximum at or above `value`, in steps of 1, 2 or 5 × 10ⁿ, split into `ticks` equal parts. */
export const niceScale = (value: number, ticks = 4) => {
  if (value <= 0) return { max: ticks, step: 1 };
  const rough = value / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough) ?? 10 * magnitude;
  return { max: step * ticks, step };
};

/** How urgent a payment waiting since `iso` is: under a day is fine, a day is late, three days overdue. */
export const waitTone = (iso: string, now = Date.now()) => {
  const hours = (now - Date.parse(iso)) / 3_600_000;
  return hours >= 72 ? "overdue" : hours >= 24 ? "late" : "fresh";
};

/** A plan label ("iOverlay Monthly · 1 month × 2") as its name and the rest, for two-line display. */
export const splitPlan = (label: string) => {
  const at = label.indexOf(" · ");
  return at === -1 ? { name: label, detail: "" } : { name: label.slice(0, at), detail: label.slice(at + 3) };
};
