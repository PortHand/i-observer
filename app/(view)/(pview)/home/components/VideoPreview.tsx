"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface VideoPreviewProps {
  open: boolean;
  src: string;
  title: string;
  poster?: string;
  /** Where to start, in seconds: the inline player's position when the preview opened. */
  startAt: number;
  /** Called on Escape, the close button or a click outside the video, with the position reached. */
  onClose: (time: number) => void;
}

/**
 * The video filling the window, with the browser's own controls (seek, volume, full screen), on a
 * native <dialog> like components/common/Modal.tsx. It plays from where the inline player was.
 */
export default function VideoPreview({ open, src, title, poster, startAt, onClose }: VideoPreviewProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = dialog.current;
    const player = video.current;
    if (!element || !player) return;
    if (open && !element.open) {
      element.showModal();
      player.currentTime = startAt;
      void player.play().catch(() => {});
    }
    if (!open && element.open) {
      player.pause();
      element.close();
    }
  }, [open, startAt]);

  const close = () => onClose(video.current?.currentTime ?? 0);

  return (
    <dialog
      ref={dialog}
      className="video-preview"
      aria-label={title}
      // Escape fires "cancel"; keep React in charge of whether the dialog is open.
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      // A click on the dialog element itself (around the video) is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <video
        ref={video}
        className="video-preview__video"
        src={open ? src : undefined}
        poster={poster}
        title={title}
        controls
        // No download item in the controls menu, and no "Save video as…" on right-click.
        controlsList="nodownload"
        playsInline
        preload="metadata"
        onContextMenu={(event) => event.preventDefault()}
      />
      <button type="button" className="video-preview__close" onClick={close} aria-label="Close preview">
        <X className="icon" strokeWidth={1.75} />
      </button>
    </dialog>
  );
}
