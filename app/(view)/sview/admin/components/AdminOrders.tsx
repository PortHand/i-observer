import { requireUser } from "@/server/features/auth/guard/authGuard";
import { orderReviewService } from "@/server/features/order/module/orderModule";
import { list, listIntro, statusTabs } from "../content/adminContent";
import { parseListQuery } from "../helper/adminHelper";
import OrderTable from "./OrderTable";
import Pagination from "./Pagination";
import SearchForm from "./SearchForm";

/** The order list for the URL's filters. Reads the session and the database: render inside <Suspense>. */
export default async function AdminOrders({ searchParams }: { searchParams: PageProps<"/sview/admin/orders">["searchParams"] }) {
  await requireUser("admin");
  const query = parseListQuery(await searchParams);
  const result = await orderReviewService.list(query.status, query.search, query.page);
  const total = result.counts[query.status];
  const title = statusTabs.find((tab) => tab.id === query.status)?.label;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="eyebrow">{total === 1 ? list.countOne : list.count.replace("{count}", String(total))}</span>
          <h1 className="admin-page__title">{title}</h1>
          <p className="text-muted admin-page__lead">{listIntro[query.status]}</p>
        </div>
        <SearchForm query={query} />
      </header>
      <OrderTable orders={result.orders} searching={Boolean(query.search)} />
      <Pagination query={query} page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
