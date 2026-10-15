import Link from "next/link";
import { list } from "../content/adminContent";
import { ordersLink, type ListQuery } from "../helper/adminHelper";

export default function Pagination({ query, page, pageCount }: { query: ListQuery; page: number; pageCount: number }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="admin-pagination mono" aria-label="Pages">
      {page > 1 ? (
        <Link className="button button--secondary button--sm" href={ordersLink({ ...query, page: page - 1 })}>
          {list.previous}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-muted">{list.page.replace("{page}", String(page)).replace("{pages}", String(pageCount))}</span>
      {page < pageCount ? (
        <Link className="button button--secondary button--sm" href={ordersLink({ ...query, page: page + 1 })}>
          {list.next}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
