import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { closing } from "../content/whatIsContent";

export default function Closing() {
  return (
    <section className="band">
      <div className="container section">
        <div className="closing">
          <div className="stack-sm">
            <h2 className="display section__title">{closing.title}</h2>
            <p className="lead">{closing.lead}</p>
          </div>
          <Link href={closing.cta.href} className="button button--primary button--lg">
            {closing.cta.label}
            <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </section>
  );
}
