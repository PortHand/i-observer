import Link from "next/link";
import { formatAmount } from "@/app/(view)/(pview)/get-ioverlay/helper/getHelper";
import { routes } from "@/helper/route";
import { accountService } from "@/server/features/account/module/accountModule";
import { requireUser } from "@/server/features/auth/guard/authGuard";
import OrderCard from "../../profile/components/OrderCard";
import { orders as copy, ordersPage } from "../../profile/content/profileContent";

/** The signed-in customer's orders and payments. Reads the session: render inside <Suspense>. */
export default async function Orders() {
  const user = await requireUser();
  const { orders, totalPaid } = await accountService.orderHistory(user.id);
  const count = orders.length === 1 ? copy.count.one : copy.count.many.replace("{count}", String(orders.length));

  return (
    <div className="profile-page">

      <div className="page-hero animate-in">
        <span className="eyebrow">{ordersPage.eyebrow}</span>
        <h1 className="display page-hero__title">{ordersPage.title}</h1>
        <p className="lead page-hero__lead">{ordersPage.lead}</p>
      </div>

      <section className="profile-section animate-in animate-in--delayed" aria-labelledby="orders-title">
        <header className="profile-section__header">
          <div className="stack-sm">
            <span className="eyebrow">{copy.label}</span>
            <h2 id="orders-title" className="display profile-section__title">
              {copy.title}
            </h2>
          </div>
          {orders.length > 0 && (
            <dl className="profile-section__totals">
              <div>
                <dt className="section-label">{count}</dt>
                <dd className="display">{formatAmount(totalPaid)}</dd>
                <dd className="hint">{copy.totalPaid}</dd>
              </div>
            </dl>
          )}
        </header>
        {orders.length === 0 ? (
          <div className="card empty-state">
            <p className="text-muted">{copy.empty}</p>
            <Link href={routes.getIOverlay} className="button button--primary">
              {copy.emptyCta}
            </Link>
          </div>
        ) : (
          <ul className="order-cards">
            {orders.map((order) => (
              <OrderCard key={order.reference} order={order} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
