/**
 * The raw story corpus, assembled at build time.
 *
 * Story Markdown comes from `corpus.generated.ts` — a snapshot of the
 * `src/content/stories/*.md` files embedded as strings (see scripts/build-stories.mjs).
 * We snapshot rather than import `*.md` directly because no single raw-text
 * import is honored by every bundler this module runs under (Vitest/Vite,
 * Next/Turbopack, and the MSW browser worker) — Turbopack rejects `?raw`. A
 * plain `.ts` module of strings is universally importable, zero-config, zero-dep.
 *
 * Spanish sidecars (`*.es.json`) ARE imported directly — JSON is supported by
 * every bundler natively. All ten stories now ship a sidecar (per-paragraph
 * translation + glossary). A story whose sidecar is absent or misaligned still
 * degrades gracefully (no translation block) — see the loader.
 */
import { STORY_MARKDOWN } from "./corpus.generated";

import cleverCrowEs from "@/content/stories/the-clever-crow.es.json";
import tripMountainsEs from "@/content/stories/a-trip-to-the-mountains.es.json";
import antGrasshopperEs from "@/content/stories/the-ant-and-the-grasshopper.es.json";
import boyCriedWolfEs from "@/content/stories/the-boy-who-cried-wolf.es.json";
import tortoiseHareEs from "@/content/stories/the-tortoise-and-the-hare.es.json";
import morningCityEs from "@/content/stories/a-morning-in-the-city.es.json";
import lostKeysEs from "@/content/stories/the-lost-keys.es.json";
import firstSmartphoneEs from "@/content/stories/my-first-smartphone.es.json";
import helpfulRobotEs from "@/content/stories/the-helpful-robot.es.json";
import lostAirportEs from "@/content/stories/lost-at-the-airport.es.json";

import type { Glossary } from "../types";

/** The shape of a `*.es.json` sidecar (per-paragraph Spanish + glossary). */
export interface StorySidecar {
  /** Spanish translation, one entry per English body paragraph, same order. */
  paragraphs: string[];
  /** Lemma → sense map for the tap-a-word popover. */
  glossary: Glossary;
}

/** One corpus entry: the raw Markdown plus an optional Spanish sidecar. */
export interface RawStory {
  raw: string;
  sidecar?: StorySidecar;
}

/** Sidecars, keyed by story id. Add an entry here when a `*.es.json` lands. */
const SIDECARS: Record<string, StorySidecar> = {
  "the-clever-crow": cleverCrowEs as StorySidecar,
  "a-trip-to-the-mountains": tripMountainsEs as StorySidecar,
  "the-ant-and-the-grasshopper": antGrasshopperEs as StorySidecar,
  "the-boy-who-cried-wolf": boyCriedWolfEs as StorySidecar,
  "the-tortoise-and-the-hare": tortoiseHareEs as StorySidecar,
  "a-morning-in-the-city": morningCityEs as StorySidecar,
  "the-lost-keys": lostKeysEs as StorySidecar,
  "my-first-smartphone": firstSmartphoneEs as StorySidecar,
  "the-helpful-robot": helpfulRobotEs as StorySidecar,
  "lost-at-the-airport": lostAirportEs as StorySidecar,
};

/**
 * The corpus, keyed by story id (matching the frontmatter `id` and the route
 * param), built from the embedded Markdown + any sidecar. Generated from the
 * `.md` filenames, so a new story flows through automatically once snapshotted.
 */
export const RAW_STORIES: Record<string, RawStory> = Object.fromEntries(
  Object.entries(STORY_MARKDOWN).map(([id, raw]) => [
    id,
    { raw, sidecar: SIDECARS[id] },
  ]),
);
