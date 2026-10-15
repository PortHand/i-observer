import Link from "next/link";
import { Paperclip } from "lucide-react";
import { formatAmount, formatPhone } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { adminOrderLink } from "@/helper/route";
import { list } from "../content/adminContent";
import { formatIst } from "../helper/adminHelper";
import type { AdminOrderSummary } from "../services/adminService";
import StatusBadge from "./StatusBadge";

/** The order list. Each reference opens the order's page, where payments are reviewed. */
export default function OrderTable({ orders, searching }: { orders: AdminOrderSummary[]; searching: boolean }) {
  if (orders.length === 0) return <p className="admin-empty text-muted">{searching ? list.emptySearch : list.empty}</p>;
  const { columns } = list;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead className="mono">
          <tr>
            <th scope="col">{columns.reference}</th>
            <th scope="col">{columns.customer}</th>
            <th scope="col">{columns.plan}</th>
            <th scope="col" className="admin-table__number">{columns.amount}</th>
            <th scope="col">{columns.utr}</th>
            <th scope="col">{columns.date}</th>
            <th scope="col">{columns.status}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.reference}>
              <td className="admin-table__nowrap">
                <Link className="text-link mono" href={adminOrderLink(order.reference)}>
                  {order.reference}
                </Link>
              </td>
              <td className="admin-table__customer">
                <span className="admin-table__primary">{order.email}</span>
                <span className="text-muted">{formatPhone(order.phone)}</span>
              </td>
              <td>{order.planLabel}</td>
              <td className="admin-table__number mono">{formatAmount(order.amount)}</td>
              <td className="mono admin-table__nowrap">
                {order.utr ?? "—"}
                {order.hasReceipt && (
                  <span className="admin-table__receipt" title={list.hasReceipt}>
                    <Paperclip className="icon icon--sm" strokeWidth={1.75} aria-hidden="true" />
                    <span className="visually-hidden">{list.hasReceipt}</span>
                  </span>
                )}
              </td>
              <td className="text-muted admin-table__nowrap">
                {order.submittedAt
                  ? list.submitted.replace("{date}", formatIst(order.submittedAt))
                  : list.created.replace("{date}", formatIst(order.createdAt))}
              </td>
              <td>
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
