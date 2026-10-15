import SectionHeader from "../../../(pview)/home/components/SectionHeader";
import { youtubeEmbedUrl } from "../../../(pview)/home/helper/homeHelper";
import { video } from "../content/welcomeContent";

export default function VideoGuide() {
  return (
    <section className="band" id="video-guide">
      <div className="container section">
        <SectionHeader eyebrow={video.eyebrow} title={video.title} lead={video.lead} />
        <div className="video">
          <iframe
            src={youtubeEmbedUrl(video.videoId)}
            title={video.videoTitle}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </section>
  );
}
