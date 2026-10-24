import { questions, questionsSection } from "../content/homeContent";
import SectionHeader from "./SectionHeader";
import TopicGrid from "./TopicGrid";

export default function Questions() {
  return (
    <section className="band band--light">
      <div className="container section">
        <SectionHeader {...questionsSection} />
        <TopicGrid topics={questions} />
      </div>
    </section>
  );
}
