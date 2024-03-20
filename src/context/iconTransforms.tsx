import {
  DrawingUtils,
  FaceLandmarker,
  type FaceLandmarkerResult,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import pkg from "lz-string";
import {
  type Component,
  Show,
  createEffect,
  createMemo,
  createSignal,
  on,
  onMount,
  useContext,
} from "solid-js";
import { type ParentComponent, createContext } from "solid-js";
import { createStore } from "solid-js/store";
import Loading from "~/components/UI/Loading";
import { useCamera } from "./camera";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  pkg;

type IconTransforms = {
  eyes: {
    position: {
      /** -1.0 ~ 1.0 */
      x: number;
      /** -1.0 ~ 1.0 */
      y: number;
    };
    /** 0.0 ~ 1.0 */
    open: number;
  };
  mouth: {
    /** 0.0 ~ 1.0 */
    open: number;
  };
  head: {
    position: {
      /** 0 mean center */
      x: number;
      /** 0 mean center */
      y: number;
    };
    /** 0 mean no rotation */
    rotation: number;
  };
};

export type IconTransformsContextState = {
  transform: IconTransforms;
  isMirrored: boolean;
};

export type IconTransformsContextActions = {
  toggleMirrored: () => void;
};

export type FaceDetectComponents = {
  DetectResultPreview: Component<{
    showVideo?: boolean;
    showCanvas?: boolean;
  }>;
};

export type IconTransformsContextValue = [
  transforms: IconTransformsContextState,
  actions: IconTransformsContextActions,
  components: FaceDetectComponents,
];

export const IconTransformsContext =
  createContext<IconTransformsContextValue>();

const defaultIconTransforms: IconTransforms = {
  eyes: {
    position: {
      x: 0,
      y: 0,
    },
    open: 0,
  },
  mouth: {
    open: 0,
  },
  head: {
    position: {
      x: 0,
      y: 0,
    },
    rotation: 0,
  },
};

// need to deep clone
const defaultPlainTransforms = () =>
  JSON.parse(JSON.stringify(defaultIconTransforms)) as IconTransforms;

export const parseTransforms = (params: string): IconTransforms => {
  return JSON.parse(
    decompressFromEncodedURIComponent(params),
  ) as IconTransforms;
};

export const IconTransformsProvider: ParentComponent<{
  params?: IconTransforms;
}> = (props) => {
  const [state, setState] = createStore<IconTransformsContextState>({
    transform: defaultPlainTransforms(),
    isMirrored: false,
  });
  const [faceDetectResult, setFaceDetectResult] =
    createSignal<FaceLandmarkerResult>();
  const [selectedCamera] = useCamera();
  let detectResVideoRef: HTMLVideoElement | undefined;
  const [detectResCanvasRef, setDetectResCanvasRef] =
    createSignal<HTMLCanvasElement>();
  const canvasCtx = createMemo(() => detectResCanvasRef()?.getContext("2d"));
  let faceLandmarker: FaceLandmarker | undefined;
  let drawingUtils: DrawingUtils | undefined;

  // canvasがmountされたらDrawingUtilsを初期化
  createEffect(
    on(canvasCtx, (ctx) => {
      if (ctx) {
        drawingUtils = new DrawingUtils(ctx);
      }
    }),
  );

  onMount(() => {
    detectResVideoRef = document.createElement("video");
  });

  // FaceLandmarkerの初期化
  const createFaceLandmarker = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    });
  };

  let lastVideoTime = -1;
  const predict = async () => {
    if (detectResVideoRef === undefined) {
      return;
    }

    const startTimeMs = performance.now();
    if (lastVideoTime !== detectResVideoRef.currentTime) {
      lastVideoTime = detectResVideoRef.currentTime;
      setFaceDetectResult(
        faceLandmarker?.detectForVideo(detectResVideoRef, startTimeMs),
      );
    }
    if (selectedCamera.deviceId) {
      window.requestAnimationFrame(predict);
    }
  };

  // カメラが変更されたらMediaStreamを再取得
  createEffect(
    on(
      () => selectedCamera.deviceId,
      async (deviceId) => {
        // stop current stream
        if (detectResVideoRef !== undefined) {
          const stream = detectResVideoRef.srcObject;
          if (stream instanceof MediaStream) {
            for (const track of stream.getTracks()) {
              track.stop();
            }
          }

          if (deviceId !== undefined) {
            if (faceLandmarker === undefined) {
              await createFaceLandmarker();
            }
            navigator.mediaDevices
              .getUserMedia({
                video: {
                  deviceId: selectedCamera.deviceId,
                },
              })
              .then((stream) => {
                if (detectResVideoRef === undefined) {
                  throw new Error("detectResVideoRef is undefined");
                }
                detectResVideoRef.srcObject = stream;
                detectResVideoRef.addEventListener("loadeddata", () => {
                  // canvasのサイズをvideoのサイズに合わせる
                  const canvas = detectResCanvasRef();
                  if (canvas) {
                    canvas.width = detectResVideoRef?.videoWidth ?? 0;
                    canvas.height = detectResVideoRef?.videoHeight ?? 0;
                  }
                  predict();
                });
                detectResVideoRef.play();
              })
              .catch((err) => {
                console.error(err);
              });
          }
        }
      },
    ),
  );

  // 顔認識結果が更新されたら描画
  createEffect(
    on(faceDetectResult, (result) => {
      if (drawingUtils === undefined) {
        return;
      }
      if (result?.faceLandmarks) {
        canvasCtx()?.clearRect(
          0,
          0,
          detectResCanvasRef()?.width ?? 0,
          detectResCanvasRef()?.height ?? 0,
        );
        for (const landmarks of result.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#C0C0C070", lineWidth: 1 },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            { color: "#FF3030" },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
            { color: "#FF3030" },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            { color: "#30FF30" },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
            { color: "#30FF30" },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            { color: "#E0E0E0" },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LIPS,
            { color: "#E0E0E0" },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
            { color: "#FF3030" },
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            { color: "#30FF30" },
          );
        }
      }
    }),
  );

  const DetectResVideo: FaceDetectComponents["DetectResultPreview"] = (
    props,
  ) => {
    return (
      <Show when={selectedCamera.deviceId}>
        <div class="relative overflow-hidden rounded">
          <div class="absolute w-full h-full top-0">
            <Loading />
          </div>
          {/* biome-ignore lint/a11y/useMediaCaption: */}
          <video
            ref={detectResVideoRef}
            class="w-full h-auto blur-20 grayscale"
          />
          <Show when={!props.showVideo}>
            <div class="absolute w-full h-full top-0 bg-black grid place-items-center">
              <div class="i-material-symbols:videocam-off-outline-rounded w-12 h-12" />
            </div>
          </Show>
          <canvas
            ref={setDetectResCanvasRef}
            class="absolute w-full h-auto top-0"
            classList={{
              hidden: !props.showCanvas,
            }}
          />
        </div>
      </Show>
    );
  };

  return (
    <IconTransformsContext.Provider
      value={[
        state,
        {
          toggleMirrored: () => {
            setState("isMirrored", (prev) => !prev);
          },
        },
        {
          DetectResultPreview: DetectResVideo,
        },
      ]}
    >
      {props.children}
    </IconTransformsContext.Provider>
  );
};

export const useIconTransforms = () => {
  const context = useContext(IconTransformsContext);
  if (!context) {
    throw new Error(
      "useIconTransforms must be used within a IconTransformsProvider",
    );
  }
  return context;
};
