"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { topicsRequiringReference, topicsWithReference, type TopicId } from "../content/contactContent";
import {
  parseContactForm,
  readPrefill,
  type ContactField,
  type ContactMessage,
  type ContactPrefill,
} from "../helper/contactHelper";
import * as contactService from "../services/contactService";

export const useContactHandler = () => {
  const [topic, setTopic] = useState<TopicId | "">("");
  const [messageLength, setMessageLength] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [sendError, setSendError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ message: ContactMessage; ticket: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [prefill, setPrefill] = useState<ContactPrefill>({});
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLHeadingElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // Fill the form from links like /contact?topic=login&reference=IOV-AB12CD#message.
  useEffect(() => {
    const next = readPrefill(window.location.search);
    if (Object.keys(next).length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only readable after hydration.
    setPrefill(next);
    if (next.topic) setTopic(next.topic);
    if (next.message) setMessageLength(next.message.length);
  }, []);

  const showReference = topic !== "" && topicsWithReference.includes(topic);
  const referenceRequired = topic !== "" && topicsRequiringReference.includes(topic);

  /** Shows field errors and takes the user to the first problem. */
  const showErrors = (fieldErrors: Partial<Record<ContactField, string>>) => {
    setErrors(fieldErrors);
    const first = Object.keys(fieldErrors)[0];
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]:not([type="hidden"]), #field-${first}`)?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseContactForm(new FormData(event.currentTarget));
    if (!result.ok) return showErrors(result.errors);

    setErrors({});
    setSendError("");
    setSubmitting(true);
    try {
      const response = await contactService.sendMessage(result.message);
      if (!response.ok) {
        // The server repeats the browser's checks; if it still rejects a field, show it there.
        if (response.fields && Object.keys(response.fields).length > 0) return showErrors(response.fields);
        return setSendError(response.error);
      }
      setSent({ message: result.message, ticket: response.ticket });
      requestAnimationFrame(() => {
        sentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        sentRef.current?.focus({ preventScroll: true });
      });
    } finally {
      setSubmitting(false);
    }
  };

  /** Clears a field's error as soon as the user edits it. */
  const clearError = (field: ContactField) => {
    if (!errors[field]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address is on screen to copy by hand.
    }
  };

  const handleSendAnother = () => {
    setSent(null);
    setPrefill({});
    setTopic("");
    setMessageLength(0);
  };

  return {
    topic,
    showReference,
    referenceRequired,
    messageLength,
    errors,
    sendError,
    submitting,
    sent,
    copied,
    prefill,
    formRef,
    sentRef,
    setTopic,
    setMessageLength,
    clearError,
    handleSubmit,
    handleCopyEmail,
    handleSendAnother,
  };
};
