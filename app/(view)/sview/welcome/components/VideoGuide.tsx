import SectionHeader from "../../../(pview)/home/components/SectionHeader";
import VideoEmbed from "../../../(pview)/home/components/VideoEmbed";
import { video } from "../content/welcomeContent";

export default function VideoGuide() {
  return (
    <section className="band" id="video-guide">
      <div className="container section">
        <SectionHeader eyebrow={video.eyebrow} title={video.title} lead={video.lead} />
        <VideoEmbed src={video.videoSrc} title={video.videoTitle} />
      </div>
    </section>
  );
}
