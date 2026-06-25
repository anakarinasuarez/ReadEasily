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
  "font-display text-[length:var(--text-heading-h3-size)] font-bold leading-[var(--text-heading-h3-line-height)] tracking-[var(--text-heading-h3-tracking)] text-primary";
const subtitleType =
  "font-ui text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-muted";
const footerType =
  "font-ui text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-muted";
const linkType =
  "font-semibold text-accent underline-offset-2 hover:underline rounded-[var(--radius-sm)] outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

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
        <div className="flex flex-col gap-[var(--space-lg)]">
          <AuthTabs active="login" />

          <div className="flex flex-col gap-[var(--space-xs)]">
            <h1 className={headingType}>Welcome back</h1>
            <p className={subtitleType}>
              Pick up your reading right where you left off.
            </p>
          </div>

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
            className="flex flex-col gap-[var(--space-lg)]"
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

          <div className="flex flex-col items-center gap-[var(--space-xs)] text-center">
            <p className={footerType}>
              New here?{" "}
              <Link href="/signup" className={linkType}>
                Sign up
              </Link>
            </p>
            <Link href="/forgot" className={linkType}>
              Forgot password?
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
