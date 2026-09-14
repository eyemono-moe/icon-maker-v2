import { createRenderEffect, createRoot } from "solid-js";
import { createStore } from "solid-js/store";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  createDebouncedUrlPersistence,
  trackStore,
} from "./debounced-url-state";

describe("createDebouncedUrlPersistence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("serializes and updates the URL once after a burst of changes", () => {
    const serialize = vi.fn(() => "encoded-state");
    const replaceUrl = vi.fn();
    const persistence = createDebouncedUrlPersistence(
      serialize,
      replaceUrl,
      100,
    );

    persistence.schedule();
    persistence.schedule();
    vi.advanceTimersByTime(99);

    expect(serialize).not.toHaveBeenCalled();
    expect(replaceUrl).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(serialize).toHaveBeenCalledOnce();
    expect(replaceUrl).toHaveBeenCalledOnce();
    expect(replaceUrl).toHaveBeenCalledWith("encoded-state");
  });

  test("does not repeat a URL update when the encoded state is unchanged", () => {
    const serialize = vi.fn(() => "encoded-state");
    const replaceUrl = vi.fn();
    const persistence = createDebouncedUrlPersistence(
      serialize,
      replaceUrl,
      100,
    );

    persistence.saveNow();
    persistence.saveNow();

    expect(serialize).toHaveBeenCalledTimes(2);
    expect(replaceUrl).toHaveBeenCalledOnce();
  });

  test("tracks real nested store changes but encodes once with the latest state", () => {
    const [state, setState] = createStore({
      hair: { type: "short", baseColor: "#9940BB" },
      background: "#BBEE66",
    });
    const encode = vi.fn((current: typeof state) => JSON.stringify(current));
    const replaceUrl = vi.fn();
    const persistence = createDebouncedUrlPersistence(
      () => encode(state),
      replaceUrl,
      100,
    );

    createRoot((dispose) => {
      createRenderEffect(() => {
        trackStore(state);
        persistence.schedule();
      });
      setState("hair", "type", "ponytail");
      setState("hair", "baseColor", "#123456");
      setState("background", "#abcdef");
      vi.advanceTimersByTime(99);
      expect(encode).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      dispose();
    });

    expect(encode).toHaveBeenCalledOnce();
    expect(replaceUrl).toHaveBeenCalledWith(
      JSON.stringify({
        hair: { type: "ponytail", baseColor: "#123456" },
        background: "#abcdef",
      }),
    );
  });
});
