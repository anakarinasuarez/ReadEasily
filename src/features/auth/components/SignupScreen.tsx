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
import {
  validateEmail,
  validateRequired,
  validateNewPassword,
} from "../lib/validation";
import { READING_HOME, LANDING } from "../lib/routes";

/* Card typography — shared with the other auth screens, all token-bound. */
const headingType =
  "font-display text-[length:var(--text-heading-h2-size)] font-bold leading-[var(--text-heading-h2-line-height)] tracking-[var(--text-heading-h2-tracking)] text-primary";
const subtitleType =
  "font-ui text-[length:var(--text-label-m-size)] font-semibold leading-[var(--text-label-m-line-height)] tracking-[var(--text-label-m-tracking)] text-muted";
/* Footer base — Nunito Regular 13px, muted (label-m geometry, regular weight). */
const footerType =
  "font-ui text-[length:var(--text-label-m-size)] font-normal leading-[var(--text-label-m-line-height)] text-muted";
/* Footer link — Baloo SemiBold, accent. */
const linkType =
  "font-display font-semibold text-accent underline-offset-2 hover:underline rounded-[var(--radius-sm)] outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

/**
 * SignupScreen — the "Create your account" auth screen (Figma 79:139), mounted
 * at `/signup`. Composed from AuthLayout → AuthCard → AuthTabs + three
 * `@/ui/input`s (Name / Email / Password) + a primary `@/ui/button`.
 *
 * Validation (name required, email format, password ≥ 8) runs on blur AND
 * submit; an invalid submit focuses the first invalid field. On success the new
 * user is written to the session store and the reader is pushed to the reading
 * home. A thrown `AuthError` maps onto the right surface: `email_taken` → email
 * field, `weak_password` → password field, anything else → the form-level alert.
 */
export function SignupScreen() {
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextNameError = validateRequired(name, "Enter your name.");
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validateNewPassword(password);
    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextNameError) {
      nameRef.current?.focus();
      return;
    }
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
      const { user } = await authClient.signUp({ name, email, password });
      signIn(user);
      router.push(READING_HOME);
    } catch (error) {
      if (isAuthError(error)) {
        if (error.code === "email_taken") {
          setEmailError("That email is already registered.");
          emailRef.current?.focus();
          setSubmitting(false);
          return;
        }
        if (error.code === "weak_password") {
          setPasswordError(error.message);
          passwordRef.current?.focus();
          setSubmitting(false);
          return;
        }
      }
      setFormError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout onBack={() => router.push(LANDING)}>
      <AuthCard>
        {/* Flat 18px rhythm: tabs → heading → subtitle → fields → CTA → footer
            are each separated by exactly 18px (Figma card is one column). */}
        <div className="flex flex-col gap-[18px]">
          <AuthTabs active="signup" />

          <h1 className={headingType}>Create your account</h1>
          <p className={subtitleType}>
            Track your progress and save words as you read.
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
              ref={nameRef}
              label="Name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() =>
                setNameError(validateRequired(name, "Enter your name."))
              }
              errorMessage={nameError}
            />
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
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordError(validateNewPassword(password))}
              errorMessage={passwordError}
            />

            <Button
              type="submit"
              size="lg"
              loading={submitting}
              rightIcon={<ArrowRightIcon />}
              className="w-full"
            >
              Create account
            </Button>
          </form>

          <p className={`text-center ${footerType}`}>
            Already have an account?{" "}
            <Link href="/login" className={linkType}>
              Log in
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
