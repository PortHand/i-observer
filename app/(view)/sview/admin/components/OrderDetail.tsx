import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { formatAmount, formatPhone } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import { orderReviewService } from "@/server/features/order/module/orderModule";
import { detail } from "../content/adminContent";
import { formatIst, ordersLink } from "../helper/adminHelper";
import type { AdminOrderDetail, OrderStatus, ReviewAction } from "../services/adminService";
import ReceiptImage from "./ReceiptImage";
import ReviewPanel from "./ReviewPanel";
import StatusBadge from "./StatusBadge";

/** What an admin can do with an order in each status. */
const AVAILABLE: Record<OrderStatus, ReviewAction[]> = {
  submitted: ["verify", "reject"],
  verified: ["resend", "refund"],
  pending: [],
  rejected: [],
  refunded: [],
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="details__row">
    <dt className="mono">{label}</dt>
    <dd>{children}</dd>
  </div>
);

const accessText = (customer: NonNullable<AdminOrderDetail["customer"]>) => {
  if (customer.lifetimeAccess) return detail.access.lifetime;
  if (customer.accessUntil) return detail.access.until.replace("{date}", formatIst(customer.accessUntil));
  return detail.access.none;
};

/** One order, with its review actions. Reads the session and the database: render inside <Suspense>. */
export default async function OrderDetail({ params }: { params: PageProps<"/sview/admin/orders/[reference]">["params"] }) {
  await requireUser("admin");
  const { reference } = await params;
  const order = await orderReviewService.detail(decodeURIComponent(reference));
  if (!order) notFound();
  const { labels, sections } = detail;
  const available = AVAILABLE[order.status];
  const idle = order.status === "pending" || order.status === "rejected" || order.status === "refunded";

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <Link className="admin-back mono" href={ordersLink({ status: order.status })}>
            <ArrowLeft className="icon icon--sm" strokeWidth={1.75} />
            {detail.back}
          </Link>
          <div className="order-head">
            <h1 className="admin-page__title">{order.reference}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-muted admin-page__lead">
            {order.email} · {formatAmount(order.amount)} · {formatIst(order.createdAt)}
          </p>
        </div>
      </header>

      <div className="order-grid">
        <div className="order-col">
          <section className="card order-card--payment">
            <h2 className="section-label">{sections.payment}</h2>
            <dl className="details">
              <Row label={labels.amount}>
                <span className="mono">{formatAmount(order.amount)}</span>
              </Row>
              <Row label={labels.utr}>{order.utr ? <span className="mono order-utr">{order.utr}</span> : <span className="text-muted">{detail.noUtr}</span>}</Row>
              <Row label={labels.payee}>
                {order.payee.name} · <span className="code">{order.payee.upiId}</span>
              </Row>
              <Row label={labels.created}>{formatIst(order.createdAt)}</Row>
              {order.submittedAt && <Row label={labels.submitted}>{formatIst(order.submittedAt)}</Row>}
            </dl>
          </section>

          <section className="card order-card--customer">
            <h2 className="section-label">{sections.customer}</h2>
            <dl className="details">
              <Row label={labels.email}>{order.email}</Row>
              <Row label={labels.phone}>{formatPhone(order.phone)}</Row>
              {order.customer ? (
                <>
                  <Row label={labels.username}>{order.customer.username}</Row>
                  <Row label={labels.access}>{accessText(order.customer)}</Row>
                </>
              ) : (
                <Row label={labels.username}>
                  <span className="text-muted">{labels.noAccount}</span>
                </Row>
              )}
            </dl>
          </section>
        </div>
        <div className="order-col">
          <section className="card order-card--review">
            <h2 className="section-label">{sections.review}</h2>
            {order.reviewedAt && (
              <dl className="details">
                <Row label={labels.reviewed}>{formatIst(order.reviewedAt)}</Row>
                {order.reviewNote && <Row label={labels.note}>{order.reviewNote}</Row>}
              </dl>
            )}
            {idle && <p className="text-muted">{detail.noActions[order.status as keyof typeof detail.noActions]}</p>}
            <ReviewPanel reference={order.reference} available={available} />
          </section>

          <section className="card order-card--receipt">
            <h2 className="section-label">{sections.receipt}</h2>
            {!order.receipt ? (
              <p className="text-muted">{detail.receipt.none}</p>
            ) : order.receipt.url ? (
              <figure className="receipt">
                <ReceiptImage src={order.receipt.url} alt={detail.receipt.alt.replace("{reference}", order.reference)} />
                <figcaption className="receipt__caption">
                  <span className="code">{order.receipt.fileName}</span>
                  <a href={order.receipt.url} target="_blank" rel="noopener noreferrer" className="panel__link mono">
                    {detail.receipt.open}
                    <ExternalLink className="icon icon--sm" strokeWidth={1.75} />
                  </a>
                </figcaption>
                <p className="text-muted receipt__note">{detail.receipt.expires}</p>
              </figure>
            ) : (
              <p className="text-muted">{detail.receipt.unavailable}</p>
            )}
          </section>

          <section className="card order-card--plans">
            <h2 className="section-label">{sections.plans}</h2>
            <dl className="details">
              {order.lines.map((line) => (
                <Row key={line.planId} label={line.label}>
                  <span className="mono">{formatAmount(line.amount)}</span>
                </Row>
              ))}
              <Row label={labels.total}>
                <strong className="mono">{formatAmount(order.amount)}</strong>
              </Row>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
