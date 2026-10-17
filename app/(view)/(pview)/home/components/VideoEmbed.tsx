import { youtubeEmbedUrl } from "../helper/homeHelper";

/**
 * A 16:9 YouTube embed that loads only when scrolled near. The frame shimmers until the player
 * paints over it, so the space never sits empty.
 */
export default function VideoEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="video video--loading">
      <iframe
        src={youtubeEmbedUrl(videoId)}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
