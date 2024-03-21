import {
  DrawingUtils,
  FaceLandmarker,
  type FaceLandmarkerResult,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
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

export type FaceDetectContextState = {
  deviceId?: string;
  cameraState: "unselected" | "loading" | "loaded" | "error";
  result?: FaceLandmarkerResult;
  isMirrored: boolean;
};

export type IconTransformsContextActions = {
  setDeviceId: (deviceId?: string) => void;
  toggleMirrored: () => void;
};

export type FaceDetectComponents = {
  DetectResultPreview: Component<{
    showVideo?: boolean;
    showCanvas?: boolean;
  }>;
};

export type FaceDetectContextValue = [
  state: FaceDetectContextState,
  actions: IconTransformsContextActions,
  components: FaceDetectComponents,
];

export const FaceDetectContext = createContext<FaceDetectContextValue>();

export const FaceDetectProvider: ParentComponent = (props) => {
  const [state, setState] = createStore<FaceDetectContextState>({
    deviceId: undefined,
    cameraState: "unselected",
    result: undefined,
    isMirrored: true,
  });

  let detectResVideoRef: HTMLVideoElement | undefined;
  // let detectResCanvasRef: HTMLCanvasElement | undefined;
  // let canvasCtx: CanvasRenderingContext2D | undefined;
  const [detectResCanvasRef, setDetectResCanvasRef] =
    createSignal<HTMLCanvasElement>();
  const canvasCtx = createMemo(() => detectResCanvasRef()?.getContext("2d"));
  let faceLandmarker: FaceLandmarker | undefined;
  let drawingUtils: DrawingUtils | undefined;

  // canvasCtxが変化したらDrawingUtilsを初期化
  createEffect(
    on(canvasCtx, (ctx) => {
      if (ctx) {
        drawingUtils = new DrawingUtils(ctx);
      }
    }),
  );

  // clientでvideo, canvas要素を作成
  onMount(async () => {
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
      outputFacialTransformationMatrixes: true,
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
      const res = faceLandmarker?.detectForVideo(
        detectResVideoRef,
        startTimeMs,
      );
      setState("result", res);
    }
    if (state.deviceId && state.cameraState === "loaded") {
      window.requestAnimationFrame(predict);
    }
  };

  // カメラが変更されたらMediaStreamを再取得
  createEffect(
    on(
      () => state.deviceId,
      async (deviceId) => {
        setState("cameraState", "loading");
        if (detectResVideoRef === undefined) return;

        // 現在のstreamを停止
        const stream = detectResVideoRef.srcObject;
        if (stream instanceof MediaStream) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
        }

        // デバイスが選択されていない場合は何もしない
        if (deviceId === undefined) {
          setState("cameraState", "unselected");
          return;
        }

        // FaceLandmarkerが初期化されていない場合は初期化
        if (faceLandmarker === undefined) {
          await createFaceLandmarker();
        }
        // deviceIdからMediaStreamを取得
        navigator.mediaDevices
          .getUserMedia({
            video: {
              deviceId: deviceId,
            },
          })
          .then((stream) => {
            onMediaStreamLoaded(stream);
          })
          .catch((err) => {
            setState("cameraState", "error");
            console.error(err);
          });
      },
    ),
  );

  // MediaStreamが取得されたらvideo要素にセット
  const onMediaStreamLoaded = (stream: MediaStream) => {
    if (detectResVideoRef === undefined) {
      throw new Error("detectResVideoRef is undefined");
    }
    detectResVideoRef.addEventListener("loadeddata", () => {
      // canvasのサイズをvideoのサイズに合わせる
      const canvas = detectResCanvasRef();
      if (canvas) {
        canvas.width = detectResVideoRef?.videoWidth ?? 0;
        canvas.height = detectResVideoRef?.videoHeight ?? 0;
      }

      setState("cameraState", "loaded");
      // 顔認識を開始
      predict();
    });

    detectResVideoRef.srcObject = stream;
  };

  // 顔認識結果が更新されたらcanvasに結果を描画
  createEffect(() => {
    const result = state.result;

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
  });

  const DetectResultPreview: FaceDetectComponents["DetectResultPreview"] = (
    props,
  ) => {
    return (
      <Show
        when={state.cameraState !== "unselected"}
        fallback={
          <div class="w-full aspect-1.5 rounded bg-black c-zinc flex flex-col gap-4 items-center justify-center ">
            <div class="i-material-symbols:videocam-off-outline-rounded w-12 h-12" />
            no camera selected
          </div>
        }
      >
        <div class="relative overflow-hidden rounded bg-black c-zinc">
          {/* biome-ignore lint/a11y/useMediaCaption: プレビューなのでcaptionは不要 */}
          <video
            ref={detectResVideoRef}
            class="w-full h-auto blur-20 grayscale"
            classList={{
              "scale-x-[-1]": state.isMirrored,
            }}
            controls={false}
            autoplay
            // @ts-expect-error: need for firefox
            disablePictureInPicture
          />
          <Show
            when={state.cameraState === "loading"}
            fallback={
              <>
                <Show when={!props.showVideo}>
                  <div class="absolute w-full h-full top-0 bg-black" />
                </Show>
                <Show when={!props.showVideo && !props.showCanvas}>
                  <div class="absolute w-full h-full top-0 bg-black flex flex-col gap-4 items-center justify-center">
                    <div class="i-material-symbols:preview-off-rounded w-12 h-12" />
                    <div>camera loaded but preview is hidden</div>
                  </div>
                </Show>
              </>
            }
          >
            <div class="absolute w-full h-full top-0">
              <Loading />
            </div>
          </Show>
          <canvas
            ref={setDetectResCanvasRef}
            class="absolute w-full h-auto top-0"
            classList={{
              hidden: !props.showCanvas,
              "scale-x-[-1]": state.isMirrored,
            }}
          />
        </div>
      </Show>
    );
  };

  return (
    <FaceDetectContext.Provider
      value={[
        state,
        {
          setDeviceId: (deviceId?: string) => {
            setState("deviceId", deviceId);
          },
          toggleMirrored: () => {
            setState("isMirrored", (prev) => !prev);
          },
        },
        {
          DetectResultPreview,
        },
      ]}
    >
      {props.children}
    </FaceDetectContext.Provider>
  );
};

export const useFaceDetect = () => {
  const c = useContext(FaceDetectContext);
  if (!c) {
    console.warn("useFaceDetect must be used within a FaceDetectProvider");
  }
  return c;
};
