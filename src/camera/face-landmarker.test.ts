import { describe, expect, it, vi } from "vitest";
import {
  CameraSession,
  type FaceLandmarkerAdapter,
  MEDIAPIPE_VERSION,
  MEDIAPIPE_WASM_URL,
  createFaceLandmarkerAdapterFromTask,
} from "./face-landmarker";

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

class FakeVideo extends EventTarget {
  srcObject: MediaStream | null = null;
  readyState = 0;
  currentTime = 0;
  videoWidth = 640;
  videoHeight = 480;
  play = vi.fn(async () => {});
}

const createStream = () => {
  const stop = vi.fn();
  return {
    stream: { getTracks: () => [{ stop }] } as unknown as MediaStream,
    stop,
  };
};

const createAdapter = (): FaceLandmarkerAdapter => ({
  detect: vi.fn(() => undefined),
  draw: vi.fn(),
  close: vi.fn(),
});

const createSession = (
  overrides: Partial<ConstructorParameters<typeof CameraSession>[0]> = {},
) => {
  const video = new FakeVideo();
  const adapter = createAdapter();
  const callbacks = {
    onLoading: vi.fn(),
    onLoaded: vi.fn(),
    onResult: vi.fn(),
    onError: vi.fn(),
  };
  const session = new CameraSession({
    video: video as unknown as HTMLVideoElement,
    createLandmarker: async () => adapter,
    getUserMedia: vi.fn(),
    requestAnimationFrame: vi.fn(() => 1),
    cancelAnimationFrame: vi.fn(),
    now: () => 10,
    ...callbacks,
    ...overrides,
  });
  return { adapter, callbacks, session, video };
};

describe("FaceLandmarkerAdapter", () => {
  it("pins the JavaScript and WASM runtime to the same version", () => {
    expect(MEDIAPIPE_VERSION).toBe("0.10.21");
    expect(MEDIAPIPE_WASM_URL).toContain(
      `@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`,
    );
  });

  it("does not run nested inference concurrently", () => {
    const holder: { adapter?: FaceLandmarkerAdapter } = {};
    let nestedResult: unknown;
    const expected = { faceLandmarks: [] };
    const task = {
      detectForVideo: vi.fn(() => {
        nestedResult = holder.adapter?.detect({} as HTMLVideoElement, 2);
        return expected;
      }),
      close: vi.fn(),
    };
    const vision = {
      DrawingUtils: class {},
      FaceLandmarker: {},
    };
    const adapter = createFaceLandmarkerAdapterFromTask(
      vision as never,
      task as never,
    );
    holder.adapter = adapter;

    expect(adapter.detect({} as HTMLVideoElement, 1)).toBe(expected);
    expect(nestedResult).toBeUndefined();
    expect(task.detectForVideo).toHaveBeenCalledTimes(1);
  });
});

describe("CameraSession", () => {
  it("keeps the newest stream when camera requests resolve out of order", async () => {
    const firstRequest = deferred<MediaStream>();
    const secondRequest = deferred<MediaStream>();
    const getUserMedia = vi
      .fn()
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise);
    const { session, video } = createSession({ getUserMedia });
    const first = createStream();
    const second = createStream();

    const firstStart = session.start("first");
    await Promise.resolve();
    const secondStart = session.start("second");
    await Promise.resolve();
    secondRequest.resolve(second.stream);
    await secondStart;
    firstRequest.resolve(first.stream);
    await firstStart;

    expect(video.srcObject).toBe(second.stream);
    expect(first.stop).toHaveBeenCalledOnce();
    expect(second.stop).not.toHaveBeenCalled();
    expect(getUserMedia).toHaveBeenNthCalledWith(2, {
      video: { deviceId: { exact: "second" } },
    });
  });

  it("releases the stream, frame, listener, and landmarker on stop", async () => {
    const active = createStream();
    const cancelAnimationFrame = vi.fn();
    const requestAnimationFrame = vi.fn(() => 42);
    const { adapter, callbacks, session, video } = createSession({
      getUserMedia: vi.fn(async () => active.stream),
      requestAnimationFrame,
      cancelAnimationFrame,
    });
    const removeEventListener = vi.spyOn(video, "removeEventListener");

    await session.start("camera");
    video.dispatchEvent(new Event("loadeddata"));
    session.stop();

    expect(callbacks.onLoaded).toHaveBeenCalledOnce();
    expect(requestAnimationFrame).toHaveBeenCalledOnce();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
    expect(removeEventListener).toHaveBeenCalledWith(
      "loadeddata",
      expect.any(Function),
    );
    expect(active.stop).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
    expect(adapter.close).toHaveBeenCalledOnce();
  });

  it("reports MediaPipe initialization failures with their stage", async () => {
    const failure = new Error("WASM failed");
    const { callbacks, session } = createSession({
      createLandmarker: async () => {
        throw failure;
      },
    });

    await session.start("camera");

    expect(callbacks.onError).toHaveBeenCalledWith({
      stage: "mediapipe",
      cause: failure,
      message: "WASM failed",
    });
  });

  it("starts one frame loop when loadeddata fires before play resolves", async () => {
    const active = createStream();
    const playRequest = deferred<void>();
    const requestAnimationFrame = vi.fn(() => 11);
    const { callbacks, session, video } = createSession({
      getUserMedia: vi.fn(async () => active.stream),
      requestAnimationFrame,
    });
    video.play.mockReturnValueOnce(playRequest.promise);

    const start = session.start("camera");
    await Promise.resolve();
    await Promise.resolve();
    video.dispatchEvent(new Event("loadeddata"));
    playRequest.resolve();
    video.readyState = 2;
    await start;

    expect(callbacks.onLoaded).toHaveBeenCalledOnce();
    expect(requestAnimationFrame).toHaveBeenCalledOnce();
  });

  it("reports video playback failures and stops the acquired stream", async () => {
    const active = createStream();
    const { callbacks, session, video } = createSession({
      getUserMedia: vi.fn(async () => active.stream),
    });
    video.play.mockRejectedValueOnce(new Error("play failed"));

    await session.start("camera");

    expect(callbacks.onError).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "playback", message: "play failed" }),
    );
    expect(active.stop).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
  });

  it("reports inference failures and releases runtime resources", async () => {
    const active = createStream();
    let animationFrameCallback: FrameRequestCallback = () => {};
    const adapter = createAdapter();
    vi.mocked(adapter.detect)
      .mockImplementationOnce(() => undefined)
      .mockImplementation(() => {
        throw new Error("inference failed");
      });
    const cancelAnimationFrame = vi.fn();
    const { callbacks, session, video } = createSession({
      createLandmarker: async () => adapter,
      getUserMedia: vi.fn(async () => active.stream),
      requestAnimationFrame: vi.fn((callback) => {
        animationFrameCallback = callback;
        return 7;
      }),
      cancelAnimationFrame,
    });

    await session.start("camera");
    video.dispatchEvent(new Event("loadeddata"));
    video.currentTime = 1;
    animationFrameCallback(10);

    expect(callbacks.onError).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: "mediapipe",
        message: "inference failed",
      }),
    );
    expect(active.stop).toHaveBeenCalledOnce();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
    expect(adapter.close).toHaveBeenCalledOnce();
  });
});
