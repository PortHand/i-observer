import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { list } from "../content/adminContent";
import { ordersLink, type ListQuery } from "../helper/adminHelper";

interface PaginationProps {
  query: ListQuery;
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}

/** The order list's footer: which rows are showing, and previous/next pages when there's more than one. */
export default function Pagination({ query, page, pageCount, pageSize, total }: PaginationProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const showing = list.showing.replace("{from}", String(from)).replace("{to}", String(to)).replace("{total}", String(total));

  return (
    <footer className="order-list__footer">
      <p className="order-list__showing">
        {showing}
        <span className="order-list__keys" aria-hidden="true">{list.keysHint}</span>
      </p>
      {pageCount > 1 && (
        <nav className="order-list__pages" aria-label="Pages">
          <span className="order-list__page mono">{list.page.replace("{page}", String(page)).replace("{pages}", String(pageCount))}</span>
          {page > 1 ? (
            <Link className="button button--secondary button--sm" href={ordersLink({ ...query, page: page - 1 })}>
              <ChevronLeft className="icon icon--sm" strokeWidth={1.75} />
              {list.previous}
            </Link>
          ) : (
            <span className="button button--secondary button--sm" aria-disabled="true">
              <ChevronLeft className="icon icon--sm" strokeWidth={1.75} />
              {list.previous}
            </span>
          )}
          {page < pageCount ? (
            <Link className="button button--secondary button--sm" href={ordersLink({ ...query, page: page + 1 })}>
              {list.next}
              <ChevronRight className="icon icon--sm" strokeWidth={1.75} />
            </Link>
          ) : (
            <span className="button button--secondary button--sm" aria-disabled="true">
              {list.next}
              <ChevronRight className="icon icon--sm" strokeWidth={1.75} />
            </span>
          )}
        </nav>
      )}
    </footer>
  );
}
