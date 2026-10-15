import { routes } from "@/helper/route";
import { statusTabs } from "../content/adminContent";
import type { StatusFilter } from "../services/adminService";

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

/** The order list with these filters, leaving defaults out of the URL. */
export const ordersLink = ({ status, search, page }: Partial<ListQuery>) => {
  const query = new URLSearchParams();
  if (status && status !== "submitted") query.set("status", status);
  if (search) query.set("q", search);
  if (page && page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `${routes.adminOrders}?${text}` : routes.adminOrders;
};

/** Admins work in India, so times show in IST whatever the server's time zone. */
export const formatIst = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(iso));

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
