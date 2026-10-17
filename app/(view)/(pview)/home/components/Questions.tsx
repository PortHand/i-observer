import { questions, questionsSection } from "../content/homeContent";
import TopicGrid from "./TopicGrid";

export default function Questions() {
  return (
    <section className="band band--light">
      <div className="container section">
        <header className="section__header">
          <h2 className="display section__title">{questionsSection.title}</h2>
          <p className="lead">{questionsSection.lead}</p>
        </header>
        <TopicGrid topics={questions} />
      </div>
    </section>
  );
}
