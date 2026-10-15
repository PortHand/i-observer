import { requireUser } from "@/server/features/auth/guard/authGuard";
import { orderReviewService } from "@/server/features/order/module/orderModule";
import { parseListQuery } from "../helper/adminHelper";
import OrderList from "./OrderList";

/**
 * The order list's first page, for the URL's filters (links from the dashboard and the sidebar
 * can set them). From there the list changes in place. Reads the session and the database:
 * render inside <Suspense>.
 */
export default async function AdminOrders({ searchParams }: { searchParams: PageProps<"/sview/admin/orders">["searchParams"] }) {
  await requireUser("admin");
  const query = parseListQuery(await searchParams);
  const result = await orderReviewService.list(query.status, query.search, query.page);
  // Keyed by the URL's filters: arriving from another link starts the list over from that page.
  return <OrderList key={`${query.status}|${query.search}|${query.page}`} query={query} result={result} />;
}
