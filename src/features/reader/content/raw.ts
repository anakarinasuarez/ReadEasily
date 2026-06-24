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
 * Translation sidecars (`*.{es,fr,pt}.json`) ARE imported directly — JSON is
 * supported by every bundler natively. All ten stories ship a sidecar per
 * language (per-paragraph translation + glossary), all three sharing one shape
 * (a generic `translation` field). A story whose sidecar for a requested
 * language is absent or misaligned still degrades gracefully (no translation
 * block) — see the loader.
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

import cleverCrowFr from "@/content/stories/the-clever-crow.fr.json";
import tripMountainsFr from "@/content/stories/a-trip-to-the-mountains.fr.json";
import antGrasshopperFr from "@/content/stories/the-ant-and-the-grasshopper.fr.json";
import boyCriedWolfFr from "@/content/stories/the-boy-who-cried-wolf.fr.json";
import tortoiseHareFr from "@/content/stories/the-tortoise-and-the-hare.fr.json";
import morningCityFr from "@/content/stories/a-morning-in-the-city.fr.json";
import lostKeysFr from "@/content/stories/the-lost-keys.fr.json";
import firstSmartphoneFr from "@/content/stories/my-first-smartphone.fr.json";
import helpfulRobotFr from "@/content/stories/the-helpful-robot.fr.json";
import lostAirportFr from "@/content/stories/lost-at-the-airport.fr.json";

import cleverCrowPt from "@/content/stories/the-clever-crow.pt.json";
import tripMountainsPt from "@/content/stories/a-trip-to-the-mountains.pt.json";
import antGrasshopperPt from "@/content/stories/the-ant-and-the-grasshopper.pt.json";
import boyCriedWolfPt from "@/content/stories/the-boy-who-cried-wolf.pt.json";
import tortoiseHarePt from "@/content/stories/the-tortoise-and-the-hare.pt.json";
import morningCityPt from "@/content/stories/a-morning-in-the-city.pt.json";
import lostKeysPt from "@/content/stories/the-lost-keys.pt.json";
import firstSmartphonePt from "@/content/stories/my-first-smartphone.pt.json";
import helpfulRobotPt from "@/content/stories/the-helpful-robot.pt.json";
import lostAirportPt from "@/content/stories/lost-at-the-airport.pt.json";

import type { Glossary, Language } from "../types";

/** The shape of a sidecar (per-paragraph translation + glossary). */
export interface StorySidecar {
  /** Translation, one entry per English body paragraph, same order. */
  paragraphs: string[];
  /** Lemma → sense map for the tap-a-word popover. */
  glossary: Glossary;
}

/** A story's sidecars, by language. A language may be absent (degrades). */
export type StorySidecars = Partial<Record<Language, StorySidecar>>;

/** One corpus entry: the raw Markdown plus its per-language sidecars. */
export interface RawStory {
  raw: string;
  sidecars: StorySidecars;
}

/** Sidecars, keyed by story id then language. Add an entry per language file. */
const SIDECARS: Record<string, StorySidecars> = {
  "the-clever-crow": {
    es: cleverCrowEs as StorySidecar,
    fr: cleverCrowFr as StorySidecar,
    pt: cleverCrowPt as StorySidecar,
  },
  "a-trip-to-the-mountains": {
    es: tripMountainsEs as StorySidecar,
    fr: tripMountainsFr as StorySidecar,
    pt: tripMountainsPt as StorySidecar,
  },
  "the-ant-and-the-grasshopper": {
    es: antGrasshopperEs as StorySidecar,
    fr: antGrasshopperFr as StorySidecar,
    pt: antGrasshopperPt as StorySidecar,
  },
  "the-boy-who-cried-wolf": {
    es: boyCriedWolfEs as StorySidecar,
    fr: boyCriedWolfFr as StorySidecar,
    pt: boyCriedWolfPt as StorySidecar,
  },
  "the-tortoise-and-the-hare": {
    es: tortoiseHareEs as StorySidecar,
    fr: tortoiseHareFr as StorySidecar,
    pt: tortoiseHarePt as StorySidecar,
  },
  "a-morning-in-the-city": {
    es: morningCityEs as StorySidecar,
    fr: morningCityFr as StorySidecar,
    pt: morningCityPt as StorySidecar,
  },
  "the-lost-keys": {
    es: lostKeysEs as StorySidecar,
    fr: lostKeysFr as StorySidecar,
    pt: lostKeysPt as StorySidecar,
  },
  "my-first-smartphone": {
    es: firstSmartphoneEs as StorySidecar,
    fr: firstSmartphoneFr as StorySidecar,
    pt: firstSmartphonePt as StorySidecar,
  },
  "the-helpful-robot": {
    es: helpfulRobotEs as StorySidecar,
    fr: helpfulRobotFr as StorySidecar,
    pt: helpfulRobotPt as StorySidecar,
  },
  "lost-at-the-airport": {
    es: lostAirportEs as StorySidecar,
    fr: lostAirportFr as StorySidecar,
    pt: lostAirportPt as StorySidecar,
  },
};

/**
 * The corpus, keyed by story id (matching the frontmatter `id` and the route
 * param), built from the embedded Markdown + any sidecars. Generated from the
 * `.md` filenames, so a new story flows through automatically once snapshotted.
 */
export const RAW_STORIES: Record<string, RawStory> = Object.fromEntries(
  Object.entries(STORY_MARKDOWN).map(([id, raw]) => [
    id,
    { raw, sidecars: SIDECARS[id] ?? {} },
  ]),
);
