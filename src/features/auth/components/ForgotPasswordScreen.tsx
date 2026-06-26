"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { authClient } from "@/features/auth/api/authClient";
import { AuthLayout } from "./auth-layout";
import { AuthCard } from "./auth-card";
import { ArrowRightIcon, CheckIcon } from "./icons";
import { validateEmail } from "../lib/validation";
import { LANDING } from "../lib/routes";

/* Card typography — shared with the other auth screens, all token-bound. */
const headingType =
  "font-display text-[length:var(--text-heading-h2-size)] font-bold leading-[var(--text-heading-h2-line-height)] tracking-[var(--text-heading-h2-tracking)] text-primary";
const subtitleType =
  "font-ui text-[length:var(--text-label-m-size)] font-semibold leading-[var(--text-label-m-line-height)] tracking-[var(--text-label-m-tracking)] text-muted";
const backLinkType =
  "font-ui text-[length:var(--text-ui-m-size)] leading-[var(--text-ui-m-line-height)] text-muted underline-offset-2 hover:underline hover:text-primary rounded-[var(--radius-sm)] outline-none focus-visible:[outline:2px_solid_var(--focus-ring)] focus-visible:[outline-offset:2px]";

/**
 * ForgotPasswordScreen — the password-reset request screen (Figma 1225:3826),
 * mounted at `/forgot`. A sub-flow of Log-in, so it shows NO AuthTabs — just the
 * AuthCard heading, a single Email input, and a primary CTA.
 *
 * Email is validated on blur AND submit (invalid submit focuses the field). On a
 * successful `resetPasswordForEmail` the card swaps to a design-approved success
 * state (not in Figma): a check glyph, "Check your inbox", the address we sent
 * to, and a back link. That success panel is a `role="status"` live region and
 * receives focus on its heading so screen-reader and keyboard users land on the
 * confirmation. "Back to log in" is always present in the form state too.
 */
export function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation heading once the success state is shown.
  useEffect(() => {
    if (sentTo !== null) successHeadingRef.current?.focus();
  }, [sentTo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    if (nextEmailError) {
      emailRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await authClient.resetPasswordForEmail(email);
      setSentTo(email.trim());
    } catch {
      setEmailError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout onBack={() => router.push(LANDING)}>
      <AuthCard>
        {sentTo !== null ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-[var(--space-md)] text-center"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-[48px] items-center justify-center rounded-full bg-[var(--feedback-success-subtle)] text-[var(--feedback-success)] [&>svg]:size-[28px]"
            >
              <CheckIcon />
            </span>
            <h1
              ref={successHeadingRef}
              tabIndex={-1}
              className={`${headingType} outline-none`}
            >
              Check your inbox
            </h1>
            <p className={subtitleType}>
              We sent a reset link to {sentTo}.
            </p>
            <Link href="/login" className={`mt-[var(--space-sm)] ${backLinkType}`}>
              Back to log in
            </Link>
          </div>
        ) : (
          // Flat 18px rhythm: heading → subtitle → field → CTA → back link are
          // each separated by exactly 18px (Figma card is one column).
          <div className="flex flex-col gap-[18px]">
            <h1 className={headingType}>Reset your password</h1>
            <p className={subtitleType}>
              Enter your email and we&apos;ll send you a reset link.
            </p>

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

              <Button
                type="submit"
                size="lg"
                loading={submitting}
                rightIcon={<ArrowRightIcon />}
                className="w-full"
              >
                Send reset link
              </Button>
            </form>

            <Link href="/login" className={backLinkType}>
              Back to log in
            </Link>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
