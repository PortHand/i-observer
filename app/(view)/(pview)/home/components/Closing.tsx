import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ClosingProps {
  title: string;
  lead: string;
  cta: { href: string; label: string };
}

/** Closing call to action between two ink rules, shared by every page. */
export default function Closing({ title, lead, cta }: ClosingProps) {
  return (
    <section className="band">
      <div className="container section">
        <div className="closing">
          <div className="stack-sm">
            <h2 className="display section__title">{title}</h2>
            <p className="lead">{lead}</p>
          </div>
          <Link href={cta.href} className="button button--primary button--lg">
            {cta.label}
            <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </section>
  );
}
