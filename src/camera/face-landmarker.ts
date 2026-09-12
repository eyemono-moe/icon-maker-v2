import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export const MEDIAPIPE_VERSION = "0.10.21";
export const MEDIAPIPE_WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
export const FACE_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

type VisionModule = typeof import("@mediapipe/tasks-vision");
type FaceLandmarkerTask = Awaited<
  ReturnType<VisionModule["FaceLandmarker"]["createFromOptions"]>
>;

export type FaceLandmarkerAdapter = {
  detect: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => FaceLandmarkerResult | undefined;
  draw: (
    context: CanvasRenderingContext2D,
    result: FaceLandmarkerResult,
  ) => void;
  close: () => void;
};

export const createFaceLandmarkerAdapter =
  async (): Promise<FaceLandmarkerAdapter> => {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset =
      await vision.FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
    const task = await vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: FACE_LANDMARKER_MODEL_URL,
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    });

    return createFaceLandmarkerAdapterFromTask(vision, task);
  };

export const createFaceLandmarkerAdapterFromTask = (
  vision: Pick<VisionModule, "DrawingUtils" | "FaceLandmarker">,
  task: Pick<FaceLandmarkerTask, "detectForVideo" | "close">,
): FaceLandmarkerAdapter => {
  let detecting = false;
  let closed = false;
  const drawingUtils = new WeakMap<
    CanvasRenderingContext2D,
    InstanceType<VisionModule["DrawingUtils"]>
  >();

  return {
    detect: (video, timestamp) => {
      if (closed || detecting) return undefined;
      detecting = true;
      try {
        return task.detectForVideo(video, timestamp);
      } finally {
        detecting = false;
      }
    },
    draw: (context, result) => {
      let drawing = drawingUtils.get(context);
      if (!drawing) {
        drawing = new vision.DrawingUtils(context);
        drawingUtils.set(context, drawing);
      }

      const connectorSets = [
        [vision.FaceLandmarker.FACE_LANDMARKS_TESSELATION, "#C0C0C070", 1],
        [vision.FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, "#FF3030"],
        [vision.FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, "#FF3030"],
        [vision.FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, "#30FF30"],
        [vision.FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, "#30FF30"],
        [vision.FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, "#E0E0E0"],
        [vision.FaceLandmarker.FACE_LANDMARKS_LIPS, "#E0E0E0"],
        [vision.FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, "#FF3030"],
        [vision.FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, "#30FF30"],
      ] as const;

      for (const landmarks of result.faceLandmarks) {
        for (const [connectors, color, lineWidth] of connectorSets) {
          drawing.drawConnectors(landmarks, connectors, { color, lineWidth });
        }
      }
    },
    close: () => {
      if (closed) return;
      closed = true;
      task.close();
    },
  };
};

export type CameraErrorStage = "mediapipe" | "camera" | "playback";

export type CameraSessionError = {
  stage: CameraErrorStage;
  cause: unknown;
  message: string;
};

type CameraSessionOptions = {
  video: HTMLVideoElement;
  createLandmarker?: () => Promise<FaceLandmarkerAdapter>;
  getUserMedia?: MediaDevices["getUserMedia"];
  requestAnimationFrame?: typeof window.requestAnimationFrame;
  cancelAnimationFrame?: typeof window.cancelAnimationFrame;
  now?: () => number;
  onLoading: () => void;
  onLoaded: () => void;
  onResult: (result: FaceLandmarkerResult | undefined) => void;
  onError: (error: CameraSessionError) => void;
};

const stopStream = (stream: MediaStream | null | undefined) => {
  for (const track of stream?.getTracks() ?? []) track.stop();
};

const toSessionError = (
  stage: CameraErrorStage,
  cause: unknown,
): CameraSessionError => ({
  stage,
  cause,
  message: cause instanceof Error ? cause.message : String(cause),
});

export class CameraSession {
  private readonly video: HTMLVideoElement;
  private readonly createLandmarker: () => Promise<FaceLandmarkerAdapter>;
  private readonly getUserMedia: MediaDevices["getUserMedia"];
  private readonly requestFrame: typeof window.requestAnimationFrame;
  private readonly cancelFrame: typeof window.cancelAnimationFrame;
  private readonly now: () => number;
  private readonly onLoading: () => void;
  private readonly onLoaded: () => void;
  private readonly onResult: CameraSessionOptions["onResult"];
  private readonly onError: CameraSessionOptions["onError"];
  private requestVersion = 0;
  private stream?: MediaStream;
  private frameId?: number;
  private loadedDataListener?: EventListener;
  private landmarker?: FaceLandmarkerAdapter;
  private landmarkerPromise?: Promise<FaceLandmarkerAdapter>;
  private lastVideoTime = -1;

  constructor(options: CameraSessionOptions) {
    this.video = options.video;
    this.createLandmarker =
      options.createLandmarker ?? createFaceLandmarkerAdapter;
    this.getUserMedia =
      options.getUserMedia ??
      navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    this.requestFrame =
      options.requestAnimationFrame ??
      window.requestAnimationFrame.bind(window);
    this.cancelFrame =
      options.cancelAnimationFrame ?? window.cancelAnimationFrame.bind(window);
    this.now = options.now ?? (() => performance.now());
    this.onLoading = options.onLoading;
    this.onLoaded = options.onLoaded;
    this.onResult = options.onResult;
    this.onError = options.onError;
  }

  async start(deviceId: string): Promise<void> {
    const version = ++this.requestVersion;
    this.releaseCamera();
    this.onLoading();

    let landmarker: FaceLandmarkerAdapter;
    try {
      landmarker = await this.getLandmarker();
    } catch (cause) {
      if (version === this.requestVersion) {
        this.onError(toSessionError("mediapipe", cause));
      }
      return;
    }
    if (version !== this.requestVersion) return;

    let stream: MediaStream;
    try {
      stream = await this.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
    } catch (cause) {
      if (version === this.requestVersion) {
        this.onError(toSessionError("camera", cause));
      }
      return;
    }
    if (version !== this.requestVersion) {
      stopStream(stream);
      return;
    }

    this.stream = stream;
    let loaded = false;
    const handleLoadedData = () => {
      if (version !== this.requestVersion || loaded) return;
      loaded = true;
      this.removeLoadedDataListener();
      this.onLoaded();
      this.predict(version, landmarker);
    };
    this.loadedDataListener = handleLoadedData;
    this.video.addEventListener("loadeddata", handleLoadedData);
    this.video.srcObject = stream;

    try {
      await this.video.play();
    } catch (cause) {
      if (version === this.requestVersion) {
        this.releaseCamera();
        this.onError(toSessionError("playback", cause));
      }
      return;
    }

    if (version === this.requestVersion && this.video.readyState >= 2) {
      handleLoadedData();
    }
  }

  stop(): void {
    this.requestVersion += 1;
    this.releaseCamera();
    this.onResult(undefined);

    const activeLandmarker = this.landmarker;
    activeLandmarker?.close();
    this.landmarker = undefined;
    const pendingLandmarker = activeLandmarker
      ? undefined
      : this.landmarkerPromise;
    this.landmarkerPromise = undefined;
    pendingLandmarker?.then((landmarker) => landmarker.close()).catch(() => {});
  }

  draw(context: CanvasRenderingContext2D, result: FaceLandmarkerResult): void {
    this.landmarker?.draw(context, result);
  }

  private getLandmarker(): Promise<FaceLandmarkerAdapter> {
    if (this.landmarker) return Promise.resolve(this.landmarker);
    if (!this.landmarkerPromise) {
      const promise = this.createLandmarker();
      this.landmarkerPromise = promise;
      promise
        .then((landmarker) => {
          if (this.landmarkerPromise === promise) this.landmarker = landmarker;
        })
        .catch(() => {
          if (this.landmarkerPromise === promise)
            this.landmarkerPromise = undefined;
        });
    }
    return this.landmarkerPromise;
  }

  private predict(version: number, landmarker: FaceLandmarkerAdapter): void {
    if (version !== this.requestVersion || !this.stream) return;
    if (this.lastVideoTime !== this.video.currentTime) {
      this.lastVideoTime = this.video.currentTime;
      try {
        this.onResult(landmarker.detect(this.video, this.now()));
      } catch (cause) {
        this.stop();
        this.onError(toSessionError("mediapipe", cause));
        return;
      }
    }
    this.frameId = this.requestFrame(() => this.predict(version, landmarker));
  }

  private removeLoadedDataListener(): void {
    if (!this.loadedDataListener) return;
    this.video.removeEventListener("loadeddata", this.loadedDataListener);
    this.loadedDataListener = undefined;
  }

  private releaseCamera(): void {
    this.removeLoadedDataListener();
    if (this.frameId !== undefined) {
      this.cancelFrame(this.frameId);
      this.frameId = undefined;
    }
    stopStream(this.stream);
    this.stream = undefined;
    if (this.video.srcObject) this.video.srcObject = null;
    this.lastVideoTime = -1;
  }
}
