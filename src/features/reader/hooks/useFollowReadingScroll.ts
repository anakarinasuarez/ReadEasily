"use client";

import { useEffect, useRef } from "react";

/**
 * useFollowReadingScroll — keep the currently-spoken sentence comfortably in
 * view while audio plays (a user request).
 *
 * The Reader highlights one sentence at a time; this watches the active
 * sentence's first word (its page-global index) and, ONLY while playing, scrolls
 * that word's token to the centre of the viewport whenever the sentence
 * advances. It scrolls once per sentence change (tracked in a ref), so it never
 * fights a reader who scrolls away mid-sentence, and it does nothing when audio
 * is paused/idle. `prefers-reduced-motion` makes the scroll instant (no smooth).
 *
 * The target is resolved by a `data-word-index` query by default; tests inject
 * `resolveTarget` to supply a stub element.
 */
export interface UseFollowReadingScrollParams {
  /** Page-global word index of the active sentence's first word, or null. */
  targetWordIndex: number | null;
  /** Only follow the reading while audio is actually playing. */
  playing: boolean;
  /** Resolve the scroll target element for a word index (injectable for tests). */
  resolveTarget?: (wordIndex: number) => Element | null;
}

function defaultResolveTarget(wordIndex: number): Element | null {
  if (typeof document === "undefined") return null;
  return document.querySelector(`[data-word-index="${wordIndex}"]`);
}

function prefersReducedMotion(): boolean {
  // The in-app "Reduce motion" toggle (store.reduceMotion) is reflected onto
  // <html data-reduce-motion="true"> at the app root — honor it alongside the OS
  // setting so an opted-in user gets an instant (non-smooth) follow-scroll.
  if (
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-reduce-motion") === "true"
  ) {
    return true;
  }
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useFollowReadingScroll({
  targetWordIndex,
  playing,
  resolveTarget = defaultResolveTarget,
}: UseFollowReadingScrollParams): void {
  // The last index we scrolled to — so we scroll once per sentence-advance and
  // never re-yank the page on unrelated re-renders.
  const lastScrolledRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing || targetWordIndex == null) {
      // Idle/paused: forget the position so the next play re-centres.
      lastScrolledRef.current = null;
      return;
    }
    if (lastScrolledRef.current === targetWordIndex) return;
    lastScrolledRef.current = targetWordIndex;

    const target = resolveTarget(targetWordIndex);
    target?.scrollIntoView({
      block: "center",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [targetWordIndex, playing, resolveTarget]);
}
