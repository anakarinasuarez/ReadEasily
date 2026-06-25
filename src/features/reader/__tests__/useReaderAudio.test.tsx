import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useReaderAudio } from "../hooks/useReaderAudio";
import { buildSentences } from "../audio/sentences";
import type { ReaderSpeech, SpeakOptions } from "../audio/speechController";
import type { StoryPage, VoiceAccent } from "../types";

/**
 * useReaderAudio with a FAKE controller — never the real speechSynthesis (jsdom
 * has none). The fake records `speak` calls and exposes the per-utterance
 * callbacks so the test can fire `onStart` / `onEnd` synchronously and assert
 * the sentence-queue transport, highlight, speed and pronounce behaviors.
 */

const PAGE: StoryPage = {
  index: 0,
  paragraphs: ["One two. Three four."],
  translationParagraphs: [],
};
// → [{ "One two." 0-1 }, { "Three four." 2-3 }]
const SENTENCES = buildSentences(PAGE);

function makeFake() {
  const calls: { text: string; options?: SpeakOptions }[] = [];
  const cancel = vi.fn();
  const controller: ReaderSpeech = {
    speak: (text, options) => calls.push({ text, options }),
    cancel,
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: () => [],
    onVoicesChanged: () => () => {},
  };
  return { controller, calls, cancel };
}

function setup(supported = true) {
  const fake = makeFake();
  const view = renderHook(() =>
    useReaderAudio({
      sentences: SENTENCES,
      controller: fake.controller,
      supported,
      resetKey: 0,
    }),
  );
  return { ...fake, ...view };
}

const last = (calls: { text: string; options?: SpeakOptions }[]) =>
  calls[calls.length - 1];

describe("useReaderAudio", () => {
  it("plays sentence 0, highlights it on start, advances on end", () => {
    const { result, calls } = setup();

    act(() => result.current.play());
    expect(calls[0].text).toBe("One two.");

    act(() => calls[0].options?.onStart?.());
    expect(result.current.currentSentence).toBe(0);
    expect(result.current.currentWordRange).toEqual({ start: 0, end: 1 });
    expect(result.current.playing).toBe(true);

    act(() => calls[0].options?.onEnd?.());
    expect(calls[1].text).toBe("Three four.");
  });

  it("pauses: cancels, stops, clears the highlight", () => {
    const { result, calls, cancel } = setup();

    act(() => result.current.play());
    act(() => calls[0].options?.onStart?.());
    cancel.mockClear();

    act(() => result.current.pause());
    expect(cancel).toHaveBeenCalled();
    expect(result.current.playing).toBe(false);
    expect(result.current.currentWordRange).toBeNull();
  });

  it("next / prev / restart jump the index and speak the right sentence", () => {
    const { result, calls } = setup();

    act(() => result.current.play());
    act(() => calls[0].options?.onStart?.());

    act(() => result.current.next());
    expect(result.current.currentSentence).toBe(1);
    expect(last(calls).text).toBe("Three four.");

    act(() => result.current.prev());
    expect(result.current.currentSentence).toBe(0);
    expect(last(calls).text).toBe("One two.");

    act(() => result.current.restart());
    expect(result.current.currentSentence).toBe(0);
    expect(last(calls).text).toBe("One two.");
  });

  it("skipEnd stops and moves to the last sentence without a new utterance", () => {
    const { result, calls } = setup();

    act(() => result.current.play());
    act(() => calls[0].options?.onStart?.());
    const before = calls.length;

    act(() => result.current.skipEnd());
    expect(result.current.playing).toBe(false);
    expect(result.current.currentSentence).toBe(SENTENCES.length - 1);
    expect(result.current.currentWordRange).toBeNull();
    expect(calls.length).toBe(before);
  });

  it("setSpeed changes the rate of subsequent utterances", () => {
    const { result, calls } = setup();

    act(() => result.current.setSpeed(1.5));
    act(() => result.current.play());
    expect(last(calls).options?.rate).toBe(1.5);
    expect(result.current.speed).toBe(1.5);
  });

  it("pronounceWord speaks the single word and pauses the story", () => {
    const { result, calls } = setup();

    act(() => result.current.play());
    act(() => calls[0].options?.onStart?.());

    act(() => result.current.pronounceWord("hello"));
    expect(last(calls).text).toBe("hello");
    expect(result.current.playing).toBe(false);
    expect(result.current.currentWordRange).toBeNull();
  });

  it("is disabled and inert when speech is unsupported", () => {
    const { result, calls } = setup(false);

    expect(result.current.status).toBe("disabled");
    act(() => result.current.play());
    expect(calls.length).toBe(0);
  });

  it("picks the voice matching the chosen accent across all four, switching on change", () => {
    const enUS = { lang: "en-US", name: "US voice" } as SpeechSynthesisVoice;
    const enGB = { lang: "en-GB", name: "UK voice" } as SpeechSynthesisVoice;
    const enAU = { lang: "en-AU", name: "AU voice" } as SpeechSynthesisVoice;
    const enCA = { lang: "en-CA", name: "CA voice" } as SpeechSynthesisVoice;
    const calls: { text: string; options?: SpeakOptions }[] = [];
    const controller: ReaderSpeech = {
      speak: (text, options) => calls.push({ text, options }),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: () => [enUS, enGB, enAU, enCA],
      onVoicesChanged: () => () => {},
    };

    const { result, rerender } = renderHook(
      ({ accent }: { accent: VoiceAccent }) =>
        useReaderAudio({
          sentences: SENTENCES,
          controller,
          supported: true,
          resetKey: 0,
          voiceAccent: accent,
        }),
      { initialProps: { accent: "en-US" as VoiceAccent } },
    );

    act(() => result.current.play());
    expect(last(calls).options?.voice?.lang).toBe("en-US");

    rerender({ accent: "en-GB" });
    act(() => result.current.restart());
    expect(last(calls).options?.voice?.lang).toBe("en-GB");

    rerender({ accent: "en-AU" });
    act(() => result.current.restart());
    expect(last(calls).options?.voice?.lang).toBe("en-AU");

    rerender({ accent: "en-CA" });
    act(() => result.current.restart());
    expect(last(calls).options?.voice?.lang).toBe("en-CA");
  });

  it("falls back to any English voice when the requested accent (e.g. en-AU) is missing", () => {
    const enUS = { lang: "en-US", name: "US voice" } as SpeechSynthesisVoice;
    const calls: { text: string; options?: SpeakOptions }[] = [];
    const controller: ReaderSpeech = {
      speak: (text, options) => calls.push({ text, options }),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      // No en-AU installed (common) → AU should gracefully fall back to en-US.
      getVoices: () => [enUS],
      onVoicesChanged: () => () => {},
    };

    const { result } = renderHook(() =>
      useReaderAudio({
        sentences: SENTENCES,
        controller,
        supported: true,
        resetKey: 0,
        voiceAccent: "en-AU",
      }),
    );

    act(() => result.current.play());
    expect(last(calls).options?.voice?.lang).toBe("en-US");
  });

  it("cancels speech on page turn and on unmount", () => {
    const { controller, cancel } = makeFake();
    const { rerender, unmount } = renderHook(
      ({ k }) =>
        useReaderAudio({
          sentences: SENTENCES,
          controller,
          supported: true,
          resetKey: k,
        }),
      { initialProps: { k: 0 } },
    );

    cancel.mockClear();
    rerender({ k: 1 });
    expect(cancel).toHaveBeenCalled();

    cancel.mockClear();
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
