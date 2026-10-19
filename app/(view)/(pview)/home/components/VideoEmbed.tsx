"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

/**
 * A 16:9 video with no player controls: one click anywhere plays or pauses it, and a play mark
 * shows only while it's paused. Only the first frame and length load until it's played
 * (preload="metadata"), and the frame shimmers until that first frame is ready.
 */
export default function VideoEmbed({ src, title }: { src: string; title: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const player = video.current;
    if (!player) return;
    if (player.paused) void player.play();
    else player.pause();
  };

  const className = ["video", loading && "video--loading", playing && "video--playing"].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <video
        ref={video}
        src={src}
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
    </div>
  );
}
