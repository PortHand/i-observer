import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatAmount } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import { orderReviewService } from "@/server/features/order/module/orderModule";
import { dashboard } from "../content/adminContent";
import { formatAge, formatIst, orderCount, ordersLink } from "../helper/adminHelper";
import OrderPanel from "./OrderPanel";
import StatTile from "./StatTile";

/** The admin dashboard. Reads the session and the database: render inside <Suspense>. */
export default async function Dashboard() {
  await requireUser("admin");
  const data = await orderReviewService.dashboard();
  const now = Date.parse(data.asOf);
  const { hero, tiles } = dashboard;
  const toReview = data.counts.submitted;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div className="admin-page__heading">
          <span className="eyebrow">{dashboard.eyebrow}</span>
          <h1 className="admin-page__title">{dashboard.title}</h1>
          <p className="text-muted admin-page__lead">{dashboard.lead}</p>
        </div>
      </header>

      <div className="dash-kpis">
        {/* The one number this view leads with: what's waiting on the admin. */}
        <div className="card kpi kpi--hero theme-ink">
          <p className="kpi__label mono">{hero.label}</p>
          <p className="kpi__value">{toReview}</p>
          <p className="kpi__caption text-muted">
            {data.oldestWaitingSince ? hero.waiting.replace("{age}", formatAge(data.oldestWaitingSince, now)) : hero.none}
          </p>
          {toReview > 0 && (
            <Link className="button button--primary button--sm kpi__action" href={ordersLink({ status: "submitted" })}>
              {hero.cta}
              <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
            </Link>
          )}
        </div>
        <StatTile
          label={tiles.revenue.label}
          value={formatAmount(data.thisMonth.amount)}
          caption={tiles.revenue.caption
            .replace("{orders}", orderCount(data.thisMonth.orders, dashboard.orders))
            .replace("{amount}", formatAmount(data.lastMonth.amount))}
        />
        <StatTile label={tiles.today.label} value={String(data.ordersToday)} caption={tiles.today.caption} />
        <StatTile label={tiles.pending.label} value={String(data.counts.pending)} caption={tiles.pending.caption} />
      </div>

      <div className="dash-panels">
        <OrderPanel
          title={dashboard.queue.title}
          link={{ href: ordersLink({ status: "submitted" }), label: dashboard.queue.link }}
          empty={dashboard.queue.empty}
          orders={data.queue}
          meta={(order) => (order.submittedAt ? formatAge(order.submittedAt, now) : "")}
        />
        <OrderPanel
          title={dashboard.recent.title}
          link={{ href: ordersLink({ status: "all" }), label: dashboard.recent.link }}
          empty={dashboard.recent.empty}
          orders={data.recent}
          meta={(order) => (order.reviewedAt ? formatIst(order.reviewedAt) : "")}
          showStatus
        />
      </div>
    </div>
  );
}
