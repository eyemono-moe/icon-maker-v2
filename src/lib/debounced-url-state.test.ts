import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createDebouncedUrlPersistence } from "./debounced-url-state";

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
});
