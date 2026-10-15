import { ChevronLeft, ChevronRight } from "lucide-react";
import { list } from "../content/adminContent";

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}

/** The order list's footer: which cards are showing, and previous/next when there's more than one page. */
export default function Pagination({ page, pageCount, pageSize, total, onPage }: PaginationProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const showing = list.showing.replace("{from}", String(from)).replace("{to}", String(to)).replace("{total}", String(total));

  return (
    <footer className="order-list__footer">
      <p className="order-list__showing">
        {showing}
        <span className="order-list__keys" aria-hidden="true">
          {list.keysHint}
        </span>
      </p>
      {pageCount > 1 && (
        <nav className="order-list__pages" aria-label="Pages">
          <span className="order-list__page">{list.page.replace("{page}", String(page)).replace("{pages}", String(pageCount))}</span>
          <button type="button" className="button button--secondary button--sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft className="icon icon--sm" strokeWidth={1.75} />
            {list.previous}
          </button>
          <button type="button" className="button button--secondary button--sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
            {list.next}
            <ChevronRight className="icon icon--sm" strokeWidth={1.75} />
          </button>
        </nav>
      )}
    </footer>
  );
}
