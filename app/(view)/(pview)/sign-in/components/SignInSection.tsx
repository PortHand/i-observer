"use client";

import type { ReactNode } from "react";
import { useSignInHandler } from "../handler/useSignInHandler";
import BuyPanel from "./BuyPanel";
import SignInForm from "./SignInForm";

/** `price` is the server-rendered "Plans from …" line, passed through to BuyPanel. */
export default function SignInSection({ price }: { price: ReactNode }) {
  const signIn = useSignInHandler();

  return (
    <div className="card auth sign-in__card theme-ink animate-in animate-in--delayed">
      <SignInForm
        errors={signIn.errors}
        signInError={signIn.signInError}
        submitting={signIn.submitting}
        passwordVisible={signIn.passwordVisible}
        formRef={signIn.formRef}
        onEdit={signIn.clearError}
        onTogglePassword={signIn.togglePasswordVisible}
        onSubmit={signIn.handleSubmit}
      />
      <BuyPanel price={price} />
    </div>
  );
}
