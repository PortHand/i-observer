import { homeSections } from "@/helper/route";
import { features } from "../content/homeContent";

export default function Features() {
  return (
    <section className="band band--light" id={homeSections.features}>
      <div className="container section section--compact">
        <div className="topics">
          {features.map(({ label, title, description }) => (
            <article key={title} className="topic">
              <span className="topic__label mono">{label}</span>
              <h3 className="display">{title}</h3>
              <p className="text-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
