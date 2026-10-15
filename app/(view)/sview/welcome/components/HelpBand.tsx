import Link from "next/link";
import { routes } from "@/helper/route";
import { help } from "../content/welcomeContent";

export default function HelpBand() {
  return (
    <section className="band">
      <div className="container closing">
        <div className="stack-sm">
          <h2 className="display section__title">{help.title}</h2>
          <p className="lead">{help.lead}</p>
        </div>
        <div className="download__actions">
          <Link href={routes.profile} className="button button--primary button--lg">
            {help.profile}
          </Link>
          <Link href={`${routes.contact}?topic=technical#message`} className="button button--secondary button--lg">
            {help.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}
