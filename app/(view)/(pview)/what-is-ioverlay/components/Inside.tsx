import SectionHeader from "../../home/components/SectionHeader";
import TopicGrid from "../../home/components/TopicGrid";
import { insideSection, insideTopics } from "../content/whatIsContent";

export default function Inside() {
  return (
    <section className="band band--light" id="inside">
      <div className="container section">
        <SectionHeader {...insideSection} />
        <TopicGrid topics={insideTopics} />
      </div>
    </section>
  );
}
