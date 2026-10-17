import { connection } from "next/server";
import { checkoutPlanParam } from "@/helper/route";
import { getPlansOrNone } from "@/server/features/pricing/module/pricingModule";
import { checkout, checkoutSectionId, payment } from "../content/getContent";
import Checkout from "./Checkout";

interface CheckoutLoaderProps {
  /** The page's query string. ?plan=<id> (from a "Choose" button on the home page) pre-selects that plan. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Reads the plans from the database (cached for a minute) and renders the checkout. With no plans,
 * or a database it can't reach, it shows the "checkout is paused" notice. Render inside <Suspense>.
 */
export default async function CheckoutLoader({ searchParams }: CheckoutLoaderProps) {
  // Prices come from the database, so read them per request (cached a minute), never at build time.
  await connection();
  const [plans, params] = await Promise.all([getPlansOrNone(), searchParams]);
  const requested = params[checkoutPlanParam];
  if (plans.length > 0) return <Checkout plans={plans} initialPlanId={typeof requested === "string" ? requested : null} />;

  const [before, after] = checkout.unavailable.split("{supportEmail}");
  return (
    <CheckoutNotice>
      {before}
      <a className="text-link" href={`mailto:${payment.supportEmail}`}>
        {payment.supportEmail}
      </a>
      {after}
    </CheckoutNotice>
  );
}

/** Notice with the checkout's anchor, so "#checkout" links still land here when checkout is paused. */
export function CheckoutNotice({ children }: { children: React.ReactNode }) {
  return (
    <section className="band band--light" id={checkoutSectionId}>
      <div className="container section">
        <p className="lead" role="status">
          {children}
        </p>
      </div>
    </section>
  );
}
