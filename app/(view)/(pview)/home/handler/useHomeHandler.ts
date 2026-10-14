"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { pricing, type Plan } from "../content/homeContent";
import { detectPlatform, isValidEmail, type Platform } from "../helper/homeHelper";
import * as homeService from "../services/homeService";

const subscribeNoop = () => () => {};

export const useHomeHandler = () => {
  const platform = useSyncExternalStore<Platform>(subscribeNoop, detectPlatform, () => "other");
  const [user, setUser] = useState<homeService.User | null>(null);
  const [signInError, setSignInError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pricingStatus, setPricingStatus] = useState("");
  const [overlayStatus, setOverlayStatus] = useState("");
  const signInFormRef = useRef<HTMLFormElement>(null);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    if (!isValidEmail(email)) return setSignInError("Enter a valid email address.");
    if (password === "") return setSignInError("Enter your password.");

    setSubmitting(true);
    setSignInError("");
    try {
      const result = await homeService.signIn({ email, password });
      if (result.ok) {
        form.reset();
        setUser(result.user);
      } else {
        setSignInError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await homeService.signOut();
    setUser(null);
    setOverlayStatus("");
  };

  const handleStartOverlay = () => {
    setOverlayStatus("Open the iOverlay desktop app to start the overlay.");
  };

  const focusSignIn = () => {
    const form = signInFormRef.current;
    form?.scrollIntoView({ behavior: "smooth", block: "center" });
    form?.querySelector("input")?.focus({ preventScroll: true });
  };

  const handleChoosePlan = (plan: Plan) => {
    if (!user) {
      setPricingStatus(pricing.signInRequired);
      focusSignIn();
      return;
    }
    // Placeholder until checkout is implemented.
    setPricingStatus(`Checkout for ${plan.name} isn't available yet.`);
  };

  return {
    platform,
    user,
    signInError,
    submitting,
    pricingStatus,
    overlayStatus,
    signInFormRef,
    handleSignIn,
    handleSignOut,
    handleStartOverlay,
    handleChoosePlan,
  };
};
