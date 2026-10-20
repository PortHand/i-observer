"use client";

import { X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { detail } from "../content/adminContent";

/**
 * The payment screenshot in its frame; a click opens it filling the window on a native <dialog>
 * (like components/common/Modal.tsx). There it fits the window, and a click on it (or the zoom
 * button) switches to actual size, scrolling, for reading small print.
 */
export default function ReceiptImage({ src, alt }: { src: string; alt: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const close = () => {
    setOpen(false);
    setZoomed(false);
  };

  const { preview } = detail.receipt;
  return (
    <>
      <button type="button" className="receipt__frame" onClick={() => setOpen(true)} aria-label={preview.open}>
        {/* A signed link to a private bucket: not something next/image can optimise. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
      </button>
      <dialog
        ref={dialog}
        className="image-preview"
        aria-label={alt}
        // Escape fires "cancel"; keep React in charge of whether the dialog is open.
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        {/* The stage fills the dialog, so a click on it (around the image) is a click on the backdrop. */}
        <div
          className={zoomed ? "image-preview__stage image-preview__stage--zoomed" : "image-preview__stage"}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} onClick={() => setZoomed((value) => !value)} />
        </div>
        <div className="image-preview__actions">
          <button
            type="button"
            className="image-preview__button"
            onClick={() => setZoomed((value) => !value)}
            aria-label={zoomed ? preview.fit : preview.actual}
          >
            {zoomed ? <ZoomOut className="icon" strokeWidth={1.75} /> : <ZoomIn className="icon" strokeWidth={1.75} />}
          </button>
          <button type="button" className="image-preview__button" onClick={close} aria-label={preview.close}>
            <X className="icon" strokeWidth={1.75} />
          </button>
        </div>
      </dialog>
    </>
  );
}
