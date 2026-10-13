import type { FormEvent, RefObject } from "react";
import { AppWindow, ArrowRight, CircleAlert, Info, Lock, LogOut, Mail } from "lucide-react";
import { auth } from "../content/homeContent";
import { getShortcuts, type Platform } from "../helper/homeHelper";
import type { User } from "../services/homeService";
import Keys from "./Keys";

interface AuthCardProps {
  user: User | null;
  platform: Platform;
  error: string;
  submitting: boolean;
  overlayStatus: string;
  formRef: RefObject<HTMLFormElement | null>;
  onSignIn: (event: FormEvent<HTMLFormElement>) => void;
  onSignOut: () => void;
  onStartOverlay: () => void;
}

export default function AuthCard({
  user,
  platform,
  error,
  submitting,
  overlayStatus,
  formRef,
  onSignIn,
  onSignOut,
  onStartOverlay,
}: AuthCardProps) {
  const { signIn, signedIn } = auth;

  return (
    <div className="card auth theme-ink animate-in animate-in--delayed">
      {user ? (
        <div className="form">
          <header className="auth__header">
            <span className="mono accent">{signedIn.label}</span>
            <h2>{signedIn.title}</h2>
          </header>
          <div className="profile">
            <span className="avatar" aria-hidden="true">
              {user.email.charAt(0)}
            </span>
            <div>
              <p className="profile__label">{signedIn.profileLabel}</p>
              <p className="profile__email">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            className="button button--primary button--lg button--block"
            onClick={onStartOverlay}
          >
            <AppWindow className="icon" strokeWidth={1.75} />
            {signedIn.startOverlay}
          </button>
          {overlayStatus && (
            <p className="hint" role="status">
              <Info className="icon icon--sm" strokeWidth={1.75} />
              {overlayStatus}
            </p>
          )}
          <p className="hint">
            {signedIn.toggleHint}{" "}
            <Keys accelerator={getShortcuts(platform).ToggleVisibility} platform={platform} />
          </p>
          <button type="button" className="button button--secondary button--block" onClick={onSignOut}>
            <LogOut className="icon icon--sm" strokeWidth={1.75} />
            {signedIn.signOut}
          </button>
        </div>
      ) : (
        <form ref={formRef} className="form" noValidate onSubmit={onSignIn}>
          <header className="auth__header">
            <span className="mono accent">{signIn.label}</span>
            <h2>{signIn.title}</h2>
            <p className="text-muted">{signIn.description}</p>
          </header>
          <label className="field">
            <span className="field__label">{signIn.emailLabel}</span>
            <span className="input-group">
              <Mail className="icon" strokeWidth={1.75} />
              <input
                className="input"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={signIn.emailPlaceholder}
                required
              />
            </span>
          </label>
          <label className="field">
            <span className="field__label">{signIn.passwordLabel}</span>
            <span className="input-group">
              <Lock className="icon" strokeWidth={1.75} />
              <input
                className="input"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={signIn.passwordPlaceholder}
                required
              />
            </span>
          </label>
          {error && (
            <p className="form-error" role="alert">
              <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
              <span>{error}</span>
            </p>
          )}
          <button type="submit" className="button button--primary button--block" disabled={submitting}>
            {signIn.submit}
            <ArrowRight className="icon icon--sm" strokeWidth={1.75} />
          </button>
        </form>
      )}
    </div>
  );
}
