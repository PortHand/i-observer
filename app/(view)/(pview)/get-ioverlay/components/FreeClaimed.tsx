import type { RefObject } from "react";
import Link from "next/link";
import { ArrowRight, Check, Mail } from "lucide-react";
import { routes } from "@/helper/route";
import { checkout } from "../content/getContent";
import type { Order } from "../services/getService";

/** The last step for a free plan: it's active and the login was emailed. Replaces the payment steps. */
export default function FreeClaimed({ order, headingRef }: { order: Order; headingRef: RefObject<HTMLHeadingElement | null> }) {
  const { claimed } = checkout;
  const [before, after] = claimed.message.split("{email}");

  return (
    <div className="success">
      <header className="success__header">
        <span className="success__tick" aria-hidden="true">
          <Check strokeWidth={2.5} />
        </span>
        <div className="success__heading">
          <h3 ref={headingRef} tabIndex={-1}>
            {claimed.title}
          </h3>
          <p className="success__meta mono">
            {order.reference} · {order.planLabel}
          </p>
        </div>
      </header>

      <p className="success__message">
        <Mail className="icon" strokeWidth={1.75} />
        <span>
          {before}
          <strong>{order.email}</strong>
          {after}
        </span>
      </p>

      <Link href={routes.signIn} className="button button--primary button--lg button--block">
        {claimed.signIn}
        <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
      </Link>
      <p className="form-note">{claimed.noEmail.replace("{reference}", order.reference)}</p>
    </div>
  );
}
