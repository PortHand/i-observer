"use client";

import { useRef, useState, type FormEvent } from "react";
import type { FeedbackTopic } from "../content/profileContent";
import { parseFeedbackForm, type FeedbackField } from "../helper/profileHelper";
import * as profileService from "../services/profileService";

export const useFeedbackHandler = (initial: profileService.CustomerFeedback[]) => {
  const [rating, setRating] = useState(0);
  const [topic, setTopic] = useState<FeedbackTopic | "">("");
  const [reference, setReference] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<FeedbackField, string>>>({});
  const [sendError, setSendError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState(initial);
  const formRef = useRef<HTMLFormElement>(null);

  const showErrors = (fieldErrors: Partial<Record<FeedbackField, string>>) => {
    setErrors(fieldErrors);
    const first = Object.keys(fieldErrors)[0];
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]:not([type="hidden"]), #field-${first}`)?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseFeedbackForm(new FormData(event.currentTarget));
    if (!result.ok) return showErrors(result.errors);

    setErrors({});
    setSendError("");
    setSubmitting(true);
    try {
      const response = await profileService.sendFeedback(result.input);
      if (!response.ok) {
        if (response.fields && Object.keys(response.fields).length > 0) return showErrors(response.fields);
        return setSendError(response.error);
      }
      setHistory((current) => [response.feedback, ...current]);
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  /** Clears a field's error as soon as the user edits it. */
  const clearError = (field: FeedbackField) => {
    if (!errors[field]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSendAnother = () => {
    setSent(false);
    setRating(0);
    setTopic("");
    setReference("");
    setMessageLength(0);
  };

  return {
    rating,
    topic,
    reference,
    messageLength,
    errors,
    sendError,
    submitting,
    sent,
    history,
    formRef,
    setRating,
    setTopic,
    setReference,
    setMessageLength,
    clearError,
    handleSubmit,
    handleSendAnother,
  };
};
