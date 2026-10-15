import { requireUser } from "@/server/features/auth/guard/authGuard";
import { orderReviewService } from "@/server/features/order/module/orderModule";
import { parseListQuery } from "../helper/adminHelper";
import AdminBar from "./AdminBar";
import OrderTable from "./OrderTable";
import Pagination from "./Pagination";
import SearchForm from "./SearchForm";
import StatusTabs from "./StatusTabs";

/** The order list for the URL's filters. Reads the session and the database: render inside <Suspense>. */
export default async function AdminOrders({ searchParams }: { searchParams: PageProps<"/sview/admin">["searchParams"] }) {
  const user = await requireUser("admin");
  const query = parseListQuery(await searchParams);
  const result = await orderReviewService.list(query.status, query.search, query.page);

  return (
    <>
      <AdminBar user={user} />
      <StatusTabs query={query} counts={result.counts} />
      <SearchForm query={query} />
      <OrderTable orders={result.orders} searching={Boolean(query.search)} />
      <Pagination query={query} page={result.page} pageCount={result.pageCount} />
    </>
  );
}
