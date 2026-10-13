"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { topicsWithReference, type TopicId } from "../content/contactContent";
import { parseContactForm, type ContactField, type ContactMessage } from "../helper/contactHelper";
import * as contactService from "../services/contactService";

export const useContactHandler = () => {
  const [topic, setTopic] = useState<TopicId | "">("");
  const [messageLength, setMessageLength] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [sendError, setSendError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ message: ContactMessage; ticket: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLHeadingElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const showReference = topic !== "" && topicsWithReference.includes(topic);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseContactForm(new FormData(event.currentTarget));
    if (!result.ok) {
      setErrors(result.errors);
      // Take the user to the first problem.
      const first = Object.keys(result.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]:not([type="hidden"]), #field-${first}`)?.focus();
      return;
    }

    setErrors({});
    setSendError("");
    setSubmitting(true);
    try {
      const response = await contactService.sendMessage(result.message);
      if (!response.ok) return setSendError(response.error);
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
    setTopic("");
    setMessageLength(0);
  };

  return {
    topic,
    showReference,
    messageLength,
    errors,
    sendError,
    submitting,
    sent,
    copied,
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
