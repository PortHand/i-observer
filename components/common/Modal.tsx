"use client";

// Modal dialog on the native <dialog> element: showModal() gives the backdrop, keeps focus inside,
// makes the page behind it inert and closes on Escape. Focus starts on the element marked
// data-autofocus, if any. Styles live in app/globals.css under "Modal".

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  /** Called on Escape, the close button or a click on the backdrop. */
  onClose: () => void;
  title: ReactNode;
  /** Optional line under the title; also read as the dialog's description. */
  description?: ReactNode;
  /** Small label above the title, like the step labels on the page. */
  eyebrow?: ReactNode;
  closeLabel?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, description, eyebrow, closeLabel = "Close", children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Start on the field marked data-autofocus (e.g. a code input) rather than the close button.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape fires "cancel"; keep React in charge of whether the dialog is open.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal__panel">
        <header className="modal__header">
          <div className="stack-sm">
            {eyebrow && <span className="mono accent modal__eyebrow">{eyebrow}</span>}
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label={closeLabel}>
            <X className="icon" strokeWidth={1.75} />
          </button>
        </header>
        {description && (
          <p id={descriptionId} className="modal__description">
            {description}
          </p>
        )}
        {children}
      </div>
    </dialog>
  );
}
