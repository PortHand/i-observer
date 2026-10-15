import { statusLabels } from "../content/adminContent";
import type { OrderStatus } from "../services/adminService";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge badge--${status}`}>{statusLabels[status]}</span>;
}
