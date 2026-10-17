import { homeSections } from "@/helper/route";
import { demo } from "../content/homeContent";
import SectionHeader from "./SectionHeader";
import VideoEmbed from "./VideoEmbed";

export default function Demo() {
  return (
    <section className="band" id={homeSections.demo}>
      <div className="container section">
        <SectionHeader eyebrow={demo.eyebrow} title={demo.title} lead={demo.lead} />
        <VideoEmbed videoId={demo.videoId} title={demo.videoTitle} />
      </div>
    </section>
  );
}
