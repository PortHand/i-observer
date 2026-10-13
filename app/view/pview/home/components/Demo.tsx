import { demo } from "../content/homeContent";
import { youtubeEmbedUrl } from "../helper/homeHelper";
import SectionHeader from "./SectionHeader";

export default function Demo() {
  return (
    <section className="band" id="demo">
      <div className="container section">
        <SectionHeader eyebrow={demo.eyebrow} title={demo.title} lead={demo.lead} />
        <div className="video">
          <iframe
            src={youtubeEmbedUrl(demo.videoId)}
            title={demo.videoTitle}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </section>
  );
}
