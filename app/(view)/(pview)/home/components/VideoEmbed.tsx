"use client";

import { Maximize2, Play } from "lucide-react";
import { useRef, useState } from "react";
import VideoPreview from "./VideoPreview";

/**
 * A 16:9 video with no player controls: one click anywhere plays or pauses it, and a play mark
 * shows only while it's paused. Only the first frame and length load until it's played
 * (preload="metadata"), and the frame shimmers until that first frame is ready. With a poster, the
 * poster shows straight away in place of the shimmer. The corner button opens it in a full-window
 * preview with full controls (VideoPreview.tsx), picking up where it left off either way.
 */
export default function VideoEmbed({ src, title, poster }: { src: string; title: string; poster?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(!poster);
  const [playing, setPlaying] = useState(false);
  const [preview, setPreview] = useState<{ startAt: number } | null>(null);

  const toggle = () => {
    const player = video.current;
    if (!player) return;
    if (player.paused) void player.play();
    else player.pause();
  };

  const openPreview = () => {
    const player = video.current;
    player?.pause();
    setPreview({ startAt: player?.currentTime ?? 0 });
  };

  const closePreview = (time: number) => {
    setPreview(null);
    if (video.current) video.current.currentTime = time;
  };

  const className = ["video", loading && "video--loading", playing && "video--playing"].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <video
        ref={video}
        src={src}
        poster={poster}
        title={title}
        playsInline
        disablePictureInPicture
        preload="metadata"
        onLoadedData={() => setLoading(false)}
        onError={() => setLoading(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onContextMenu={(event) => event.preventDefault()}
      />
      <button type="button" className="video__toggle" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} ${title}`}>
        <span className="video__play">
          <Play className="icon" aria-hidden />
        </span>
      </button>
      <button type="button" className="video__expand" onClick={openPreview} aria-label={`Open ${title} in full view`}>
        <Maximize2 className="icon" strokeWidth={1.75} aria-hidden />
      </button>
      <VideoPreview
        open={preview !== null}
        src={src}
        title={title}
        poster={poster}
        startAt={preview?.startAt ?? 0}
        onClose={closePreview}
      />
    </div>
  );
}
