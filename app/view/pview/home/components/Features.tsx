import { features } from "../content/homeContent";

export default function Features() {
  return (
    <section className="band band--light" id="features">
      <div className="container">
        <div className="columns">
          {features.map(({ icon: Icon, index, title, description }) => (
            <article key={title} className="column">
              <span className="icon-tile">
                <Icon className="icon" strokeWidth={1.75} />
              </span>
              <span className="column__index mono">{index}</span>
              <h3>{title}</h3>
              <p className="text-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
