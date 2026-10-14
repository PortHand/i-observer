import type { ReactNode } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { buy } from "../content/signInContent";

/** "Don't have iOverlay?" block under the sign-in form, linking to checkout. */
/** `price` is rendered by the server (LowestPrice), since prices come from the database. */
export default function BuyPanel({ price }: { price: ReactNode }) {
  return (
    <div className="sign-in__buy">
      <p className="sign-in__divider mono">
        <span>{buy.divider}</span>
      </p>
      <p className="text-muted">{buy.text}</p>
      <Link href={buy.href} className="button button--secondary button--block">
        <CreditCard className="icon icon--sm" strokeWidth={1.75} />
        {buy.cta}
      </Link>
      {price}
    </div>
  );
}
