"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { list } from "../content/adminContent";

/** Copies `value` to the clipboard and confirms with a tick for a moment. */
export default function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className={`copy-button${copied ? " copy-button--done" : ""}`}
      title={copied ? list.copied : label}
      aria-label={copied ? list.copied : label}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => setCopied(true));
      }}
    >
      {copied ? <Check className="icon icon--sm" strokeWidth={2} /> : <Copy className="icon icon--sm" strokeWidth={1.75} />}
    </button>
  );
}
