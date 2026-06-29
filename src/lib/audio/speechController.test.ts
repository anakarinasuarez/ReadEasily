import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWebSpeechController, isSpeechSupported } from "./speechController";

/**
 * Unit tests for the real Web Speech controller — the ONE place that touches
 * `window.speechSynthesis`. jsdom ships no Speech API, so we install a hand
 * fake on `window`: a `FakeSynth` that records `speak`/`cancel`/`pause`/`resume`
 * and `voiceschanged` listeners, and a `FakeUtterance` that captures the props +
 * callbacks the controller wires onto each utterance. The fake never fires audio
 * on its own — the test invokes `utter.onstart()` / `onend()` / … by hand so the
 * callback plumbing can be asserted synchronously and deterministically.
 *
 * What's locked in: speak cancels-first then queues, clamps the rate, derives
 * `lang` from the chosen voice (default `en-US`), forwards every callback, and
 * every method no-ops (never throws) when the API is absent — the SSR / feature
 * -detection contract the comment in speechController.ts promises.
 */

class FakeUtterance {
  text: string;
  rate = 1;
  lang = "";
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onboundary: ((e: { charIndex: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

class FakeSynth {
  spoken: FakeUtterance[] = [];
  cancel = vi.fn();
  pause = vi.fn();
  resume = vi.fn();
  voices: SpeechSynthesisVoice[] = [];
  listeners = new Set<() => void>();
  speak = vi.fn((u: FakeUtterance) => {
    this.spoken.push(u);
  });
  getVoices = vi.fn(() => this.voices);
  addEventListener = vi.fn((type: string, cb: () => void) => {
    if (type === "voiceschanged") this.listeners.add(cb);
  });
  removeEventListener = vi.fn((type: string, cb: () => void) => {
    if (type === "voiceschanged") this.listeners.delete(cb);
  });
  /** Fire the voiceschanged event to all current subscribers. */
  emitVoicesChanged() {
    for (const cb of this.listeners) cb();
  }
}

let synth: FakeSynth;

beforeEach(() => {
  synth = new FakeSynth();
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const lastSpoken = () => synth.spoken[synth.spoken.length - 1];

describe("isSpeechSupported", () => {
  it("is true when both the synth and the utterance constructor exist", () => {
    expect(isSpeechSupported()).toBe(true);
  });

  it("is false when the utterance constructor is missing", () => {
    vi.stubGlobal("SpeechSynthesisUtterance", undefined);
    expect(isSpeechSupported()).toBe(false);
  });

  it("is false when speechSynthesis is missing from window", () => {
    // Remove the property entirely so the `in` check fails.
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    expect(isSpeechSupported()).toBe(false);
  });
});

describe("createWebSpeechController.speak", () => {
  it("cancels any in-flight utterance BEFORE queuing the new one", () => {
    const controller = createWebSpeechController();
    controller.speak("hello");
    // The defensive cancel must precede the speak so a stray utterance can't
    // overlap — assert the call ordering, not just that both happened.
    const cancelOrder = synth.cancel.mock.invocationCallOrder[0];
    const speakOrder = synth.speak.mock.invocationCallOrder[0];
    expect(cancelOrder).toBeLessThan(speakOrder);
    expect(lastSpoken().text).toBe("hello");
  });

  it("defaults lang to en-US when no voice is supplied", () => {
    createWebSpeechController().speak("hi");
    expect(lastSpoken().lang).toBe("en-US");
    expect(lastSpoken().voice).toBeNull();
  });

  it("takes lang and voice from the supplied voice", () => {
    const voice = { lang: "en-GB", name: "UK" } as SpeechSynthesisVoice;
    createWebSpeechController().speak("hi", { voice });
    expect(lastSpoken().lang).toBe("en-GB");
    expect(lastSpoken().voice).toBe(voice);
  });

  it("clamps the rate into the Web Speech [0.1, 10] range", () => {
    const controller = createWebSpeechController();
    controller.speak("a", { rate: 20 });
    expect(lastSpoken().rate).toBe(10);
    controller.speak("b", { rate: 0.01 });
    expect(lastSpoken().rate).toBe(0.1);
    controller.speak("c", { rate: 1.5 });
    expect(lastSpoken().rate).toBe(1.5);
  });

  it("falls back to rate 1 for missing or NaN rates", () => {
    const controller = createWebSpeechController();
    controller.speak("a");
    expect(lastSpoken().rate).toBe(1);
    controller.speak("b", { rate: Number.NaN });
    expect(lastSpoken().rate).toBe(1);
  });

  it("wires onStart, onEnd and onBoundary (with charIndex) through to options", () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const onBoundary = vi.fn();
    createWebSpeechController().speak("word", { onStart, onEnd, onBoundary });

    const u = lastSpoken();
    u.onstart?.();
    u.onend?.();
    u.onboundary?.({ charIndex: 7 });

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onBoundary).toHaveBeenCalledWith(7);
  });

  it("routes onerror (including cancel-interrupts) to options.onError", () => {
    const onError = vi.fn();
    createWebSpeechController().speak("word", { onError });
    lastSpoken().onerror?.();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("does not attach handlers that weren't requested", () => {
    createWebSpeechController().speak("word");
    const u = lastSpoken();
    expect(u.onstart).toBeNull();
    expect(u.onend).toBeNull();
    expect(u.onboundary).toBeNull();
  });

  it("is a no-op (no throw, nothing queued) when the synth is absent", () => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    expect(() => createWebSpeechController().speak("hi")).not.toThrow();
    expect(synth.spoken).toHaveLength(0);
  });
});

describe("createWebSpeechController transport delegation", () => {
  it("delegates cancel, pause and resume to the synth", () => {
    const controller = createWebSpeechController();
    controller.cancel();
    controller.pause();
    controller.resume();
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    expect(synth.pause).toHaveBeenCalledTimes(1);
    expect(synth.resume).toHaveBeenCalledTimes(1);
  });

  it("swallows cancel/pause/resume when the synth is absent", () => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    const controller = createWebSpeechController();
    expect(() => {
      controller.cancel();
      controller.pause();
      controller.resume();
    }).not.toThrow();
  });
});

describe("createWebSpeechController.getVoices", () => {
  it("returns the synth's current voice list", () => {
    synth.voices = [{ lang: "en-US", name: "US" } as SpeechSynthesisVoice];
    expect(createWebSpeechController().getVoices()).toEqual(synth.voices);
  });

  it("returns an empty array when the synth is absent", () => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    expect(createWebSpeechController().getVoices()).toEqual([]);
  });
});

describe("createWebSpeechController.onVoicesChanged", () => {
  it("subscribes to voiceschanged and the returned fn unsubscribes", () => {
    const controller = createWebSpeechController();
    const cb = vi.fn();
    const unsubscribe = controller.onVoicesChanged(cb);

    synth.emitVoicesChanged();
    expect(cb).toHaveBeenCalledTimes(1);

    unsubscribe();
    synth.emitVoicesChanged();
    expect(cb).toHaveBeenCalledTimes(1); // no further calls after unsubscribe
  });

  it("returns a no-op unsubscribe (no throw) when the synth is absent", () => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    const unsubscribe = createWebSpeechController().onVoicesChanged(vi.fn());
    expect(() => unsubscribe()).not.toThrow();
  });
});
