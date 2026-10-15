import Link from "next/link";
import { Search } from "lucide-react";
import { routes } from "@/helper/route";
import { list } from "../content/adminContent";
import { ordersLink, type ListQuery } from "../helper/adminHelper";

/** A plain GET form: the search lands in the URL (?q=), so it works without JavaScript and can be shared. */
export default function SearchForm({ query }: { query: ListQuery }) {
  return (
    <form className="admin-search" action={routes.adminOrders} method="get" role="search">
      {query.status !== "submitted" && <input type="hidden" name="status" value={query.status} />}
      <label className="input-group admin-search__field">
        <span className="visually-hidden">{list.searchLabel}</span>
        <Search className="icon" strokeWidth={1.75} />
        <input
          className="input"
          type="search"
          name="q"
          defaultValue={query.search}
          placeholder={list.searchPlaceholder}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <button type="submit" className="button button--secondary">
        {list.search}
      </button>
      {query.search && (
        <Link className="text-link mono" href={ordersLink({ status: query.status })}>
          {list.clear}
        </Link>
      )}
    </form>
  );
}
