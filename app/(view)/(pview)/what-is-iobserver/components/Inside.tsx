import SectionHeader from "../../home/components/SectionHeader";
import { insideSection, insideTopics } from "../content/whatIsContent";

export default function Inside() {
  return (
    <section className="band band--light" id="inside">
      <div className="container section">
        <SectionHeader {...insideSection} />
        <div className="topics">
          {insideTopics.map(({ label, title, description }) => (
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
