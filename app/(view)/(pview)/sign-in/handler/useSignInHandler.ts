"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parseSignInForm, type SignInField } from "../helper/signInHelper";
import * as signInService from "../services/signInService";

export const useSignInHandler = () => {
  const router = useRouter();
  const [errors, setErrors] = useState<Partial<Record<SignInField, string>>>({});
  const [signInError, setSignInError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseSignInForm(new FormData(event.currentTarget));
    if (!result.ok) {
      setErrors(result.errors);
      setSignInError("");
      // Take the user to the first problem.
      const first = Object.keys(result.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setSignInError("");
    setSubmitting(true);
    try {
      const response = await signInService.signIn(result.credentials);
      if (!response.ok) {
        if (response.fields) setErrors(response.fields);
        return setSignInError(response.fields ? "" : response.error);
      }
      router.replace(response.redirectTo);
    } finally {
      setSubmitting(false);
    }
  };

  /** Clears a field's error, and the sign-in error, as soon as the user edits a field. */
  const clearError = (field: SignInField) => {
    setSignInError("");
    if (!errors[field]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const togglePasswordVisible = () => setPasswordVisible((visible) => !visible);

  return {
    errors,
    signInError,
    submitting,
    passwordVisible,
    formRef,
    handleSubmit,
    clearError,
    togglePasswordVisible,
  };
};
