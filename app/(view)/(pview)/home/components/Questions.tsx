import Link from "next/link";
import { questions, questionsSection } from "../content/homeContent";

export default function Questions() {
  return (
    <section className="band band--light">
      <div className="container section">
        <header className="section__header">
          <h2 className="display section__title">{questionsSection.title}</h2>
          <p className="lead">{questionsSection.lead}</p>
        </header>
        <div className="topics">
          {questions.map(({ label, title, description, link }) => (
            <article key={title} className="topic">
              <span className="topic__label mono">{label}</span>
              <h3 className="display">{title}</h3>
              <p className="text-muted">{description}</p>
              <Link href={link.href} className="topic__link mono">
                {link.label} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
