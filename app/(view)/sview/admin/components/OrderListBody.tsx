import type { ReactNode } from "react";
import { list } from "../content/adminContent";
import OrderCardsSkeleton from "./OrderCardsSkeleton";

/** The list's results: skeleton cards while a new search, tab or page loads, then the results. */
export default function OrderListBody({ pending, count, children }: { pending: boolean; count: number; children: ReactNode }) {
  return (
    <div className="order-list__body" aria-busy={pending}>
      {pending ? (
        <>
          <span className="visually-hidden" role="status">
            {list.loading}
          </span>
          {/* As many placeholders as cards on screen now (a few at least), so the page doesn't jump. */}
          <OrderCardsSkeleton count={Math.min(Math.max(count, 3), 9)} />
        </>
      ) : (
        children
      )}
    </div>
  );
}
