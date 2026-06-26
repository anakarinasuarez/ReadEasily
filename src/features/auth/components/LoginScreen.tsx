"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { useSession } from "@/stores/session";
import { authClient } from "@/features/auth/api/authClient";
import { isAuthError } from "@/features/auth/types";
import { AuthLayout } from "./auth-layout";
import { AuthCard } from "./auth-card";
import { AuthTabs } from "./auth-tabs";
import { ArrowRightIcon } from "./icons";
import { validateEmail, validateRequired } from "../lib/validation";
import { READING_HOME, LANDING } from "../lib/routes";

/* Card typography — Baloo heading + Nunito support copy, all token-bound. */
const headingType =
  "font-display text-[length:var(--text-heading-h2-size)] font-bold leading-[var(--text-heading-h2-line-height)] tracking-[var(--text-heading-h2-tracking)] text-primary";
const subtitleType =
  "font-ui text-[length:var(--text-label-m-size)] font-semibold leading-[var(--text-label-m-line-height)] tracking-[var(--text-label-m-tracking)] text-muted";
/* Footer "New here? Sign up" — Caption (Nunito Regular 12/16), muted, the WHOLE
   line is the /signup link (centered). */
const newHereLinkType =
  "block text-center font-ui text-[length:var(--text-caption-size)] font-normal leading-[var(--text-caption-line-height)] text-muted underline-offset-2 hover:underline rounded-[var(--radius-sm)] outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";
/* Footer "Forgot password?" — UI/M (Nunito Regular 14/20), accent, right-aligned. */
const forgotLinkType =
  "block text-right font-ui text-[length:var(--text-ui-m-size)] font-normal leading-[var(--text-ui-m-line-height)] text-accent underline-offset-2 hover:underline rounded-[var(--radius-sm)] outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

/** Copy for the form-level credential failure (Figma + handoff state matrix). */
const INVALID_CREDENTIALS = "That email or password doesn't look right.";

/**
 * LoginScreen — the "Welcome back" auth screen (Figma 600:646), mounted at
 * `/login`. Composed entirely from existing pieces: AuthLayout (split shell +
 * breadcrumb-back) → AuthCard → AuthTabs + two `@/ui/input`s + a primary
 * `@/ui/button`.
 *
 * Validation fires on blur AND on submit; an invalid submit moves focus to the
 * first invalid field. Field problems surface through the Input `errorMessage`;
 * a backend `invalid_credentials` rejection surfaces in the form-level
 * `role="alert"` live region. On success the returned user is written to the
 * session store and the reader is pushed to the reading home.
 */
export function LoginScreen() {
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validateRequired(password, "Enter your password.");
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError) {
      emailRef.current?.focus();
      return;
    }
    if (nextPasswordError) {
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await authClient.signInWithPassword({ email, password });
      signIn(user);
      router.push(READING_HOME);
    } catch (error) {
      if (isAuthError(error) && error.code === "invalid_credentials") {
        setFormError(INVALID_CREDENTIALS);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout onBack={() => router.push(LANDING)}>
      <AuthCard>
        {/* Flat 18px rhythm: tabs → heading → subtitle → fields → CTA → footer
            rows are each separated by exactly 18px (Figma card is one column). */}
        <div className="flex flex-col gap-[18px]">
          <AuthTabs active="login" />

          <h1 className={headingType}>Welcome back</h1>
          <p className={subtitleType}>
            Pick up your reading right where you left off.
          </p>

          {formError && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-[var(--radius-sm)] bg-[var(--feedback-danger-subtle)] p-[var(--space-md)] font-ui text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-[var(--feedback-danger)]"
            >
              {formError}
            </div>
          )}

          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-[18px]"
          >
            <Input
              ref={emailRef}
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailError(validateEmail(email))}
              errorMessage={emailError}
            />
            <Input
              ref={passwordRef}
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() =>
                setPasswordError(
                  validateRequired(password, "Enter your password."),
                )
              }
              errorMessage={passwordError}
            />

            <Button
              type="submit"
              size="lg"
              loading={submitting}
              rightIcon={<ArrowRightIcon />}
              className="w-full"
            >
              Log in
            </Button>
          </form>

          {/* Two rows, each a direct child of the 18px column (not a centered
              stack): "New here? Sign up" is one centered link to /signup; "Forgot
              password?" is a right-aligned accent link to /forgot. */}
          <Link href="/signup" className={newHereLinkType}>
            New here? Sign up
          </Link>
          <Link href="/forgot" className={forgotLinkType}>
            Forgot password?
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
