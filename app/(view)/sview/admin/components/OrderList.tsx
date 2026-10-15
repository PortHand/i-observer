"use client";

import { list, listIntro, statusTabs } from "../content/adminContent";
import { useOrderListHandler } from "../handler/useOrderListHandler";
import type { ListQuery } from "../helper/adminHelper";
import type { AdminOrderPage } from "../services/adminService";
import OrderCards from "./OrderCards";
import OrderListBody from "./OrderListBody";
import OrderListKeys from "./OrderListKeys";
import Pagination from "./Pagination";
import SearchForm from "./SearchForm";
import StatusTabs from "./StatusTabs";

/**
 * The order list page: heading, search, status tabs, cards and paging. Starts from the
 * server-rendered page, then changes in place (see useOrderListHandler).
 */
export default function OrderList(initial: { query: ListQuery; result: AdminOrderPage }) {
  const { query, result, error, pending, selectStatus, search, goToPage } = useOrderListHandler(initial);
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
        <SearchForm query={query} pending={pending} onSearch={search} />
      </header>
      <section className="order-list">
        <StatusTabs current={query.status} counts={result.counts} onSelect={selectStatus} />
        <OrderListBody pending={pending} count={result.orders.length}>
          {error ? (
            <p className="order-list__empty form-error" role="alert">
              {error}
            </p>
          ) : result.orders.length === 0 ? (
            <p className="order-list__empty text-muted">{query.search ? list.emptySearch : list.empty}</p>
          ) : (
            <OrderListKeys>
              <OrderCards orders={result.orders} waiting={query.status === "submitted"} asOf={result.asOf} />
            </OrderListKeys>
          )}
          {!error && total > 0 && (
            <Pagination page={result.page} pageCount={result.pageCount} pageSize={result.pageSize} total={total} onPage={goToPage} />
          )}
        </OrderListBody>
      </section>
    </div>
  );
}
