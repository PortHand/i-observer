import type { FormEvent, RefObject } from "react";
import { ArrowRight, CircleAlert, CircleUser, Eye, EyeOff, Lock } from "lucide-react";
import FieldError from "@/components/common/FieldError";
import Spinner from "@/components/common/Spinner";
import { form } from "../content/signInContent";
import type { SignInField } from "../helper/signInHelper";

interface SignInFormProps {
  errors: Partial<Record<SignInField, string>>;
  signInError: string;
  submitting: boolean;
  passwordVisible: boolean;
  formRef: RefObject<HTMLFormElement | null>;
  onEdit: (field: SignInField) => void;
  onTogglePassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function SignInForm({
  errors,
  signInError,
  submitting,
  passwordVisible,
  formRef,
  onEdit,
  onTogglePassword,
  onSubmit,
}: SignInFormProps) {
  const describe = (field: SignInField) => (errors[field] ? `${field}-error` : undefined);
  const invalid = (field: SignInField) => (errors[field] ? true : undefined);
  const PasswordIcon = passwordVisible ? EyeOff : Eye;

  return (
    <form ref={formRef} className="form" noValidate onSubmit={onSubmit}>
      <header className="auth__header">
        <span className="mono accent">{form.label}</span>
        <h2>{form.title}</h2>
        <p className="text-muted">{form.description}</p>
      </header>

      <label className="field">
        <span className="field__label">{form.usernameLabel}</span>
        <span className="input-group">
          <CircleUser className="icon" strokeWidth={1.75} />
          <input
            className="input"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={form.usernamePlaceholder}
            aria-invalid={invalid("username")}
            aria-describedby={describe("username")}
            onInput={() => onEdit("username")}
            required
          />
        </span>
        <FieldError id="username-error" message={errors.username} />
      </label>

      {/* A div, not a label: the show/hide button inside must not focus the input on click. */}
      <div className="field">
        <label htmlFor="sign-in-password" className="field__label">
          {form.passwordLabel}
        </label>
        <span className="input-group">
          <Lock className="icon" strokeWidth={1.75} />
          <input
            id="sign-in-password"
            className="input input--with-action"
            name="password"
            type={passwordVisible ? "text" : "password"}
            autoComplete="current-password"
            placeholder={form.passwordPlaceholder}
            aria-invalid={invalid("password")}
            aria-describedby={describe("password")}
            onInput={() => onEdit("password")}
            required
          />
          <button
            type="button"
            className="input-action"
            aria-label={passwordVisible ? form.hidePassword : form.showPassword}
            aria-pressed={passwordVisible}
            onClick={onTogglePassword}
          >
            <PasswordIcon className="icon icon--sm" strokeWidth={1.75} />
          </button>
        </span>
        <FieldError id="password-error" message={errors.password} />
      </div>

      {signInError && (
        <p className="form-error" role="alert">
          <CircleAlert className="icon icon--sm" strokeWidth={1.75} />
          <span>{signInError}</span>
        </p>
      )}

      <button
        type="submit"
        className="button button--primary button--lg button--block"
        disabled={submitting}
        aria-busy={submitting || undefined}
      >
        {form.submit}
        {submitting ? <Spinner /> : <ArrowRight className="icon icon--sm" strokeWidth={1.75} />}
      </button>
    </form>
  );
}
