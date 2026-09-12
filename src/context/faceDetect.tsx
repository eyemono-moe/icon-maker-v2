import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import {
  type Component,
  type ParentComponent,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  CameraSession,
  type CameraSessionError,
} from "~/camera/face-landmarker";
import Loading from "~/components/UI/Loading";

export type FaceDetectContextState = {
  deviceId?: string;
  cameraState: "unselected" | "loading" | "loaded" | "error";
  cameraError?: CameraSessionError;
  result?: FaceLandmarkerResult;
  isMirrored: boolean;
};

export type IconTransformsContextActions = {
  setDeviceId: (deviceId?: string) => void;
  retryCamera: () => void;
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

  let cameraSession: CameraSession | undefined;
  const [detectResCanvasRef, setDetectResCanvasRef] =
    createSignal<HTMLCanvasElement>();
  const canvasCtx = createMemo(() => detectResCanvasRef()?.getContext("2d"));

  const setDetectResVideoRef = (video: HTMLVideoElement) => {
    cameraSession?.stop();
    cameraSession = new CameraSession({
      video,
      onLoading: () => {
        setState({ cameraState: "loading", cameraError: undefined });
      },
      onLoaded: () => {
        const canvas = detectResCanvasRef();
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        setState("cameraState", "loaded");
      },
      onResult: (result) => setState("result", result),
      onError: (error) => {
        setState({ cameraState: "error", cameraError: error });
        console.error(`Camera ${error.stage} stage failed`, error.cause);
      },
    });
    if (state.deviceId) void cameraSession.start(state.deviceId);
  };

  createEffect(
    on(
      () => state.deviceId,
      (deviceId) => {
        if (!deviceId) {
          cameraSession?.stop();
          setState({
            cameraState: "unselected",
            cameraError: undefined,
            result: undefined,
          });
          return;
        }
        setState({ cameraState: "loading", cameraError: undefined });
        void cameraSession?.start(deviceId);
      },
    ),
  );

  createEffect(() => {
    const result = state.result;
    const context = canvasCtx();
    if (!result || !context) return;
    context.clearRect(
      0,
      0,
      detectResCanvasRef()?.width ?? 0,
      detectResCanvasRef()?.height ?? 0,
    );
    cameraSession?.draw(context, result);
  });

  onCleanup(() => {
    cameraSession?.stop();
    cameraSession = undefined;
  });

  const DetectResultPreview: FaceDetectComponents["DetectResultPreview"] = (
    previewProps,
  ) => (
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
        <video
          ref={setDetectResVideoRef}
          class="w-full h-auto blur-20 grayscale"
          classList={{ "scale-x-[-1]": state.isMirrored }}
          controls={false}
          autoplay
          muted
          playsinline
          // @ts-expect-error: need for firefox
          disablePictureInPicture
        />
        <Show when={state.cameraState === "loading"}>
          <div class="absolute w-full h-full top-0">
            <Loading />
          </div>
        </Show>
        <Show when={state.cameraState === "error"}>
          <div
            class="absolute w-full h-full top-0 bg-black flex flex-col gap-2 items-center justify-center p-4 text-center"
            role="alert"
          >
            <div>camera {state.cameraError?.stage ?? "unknown"} error</div>
            <div class="text-sm">{state.cameraError?.message}</div>
            <button
              type="button"
              class="rounded bg-white c-black px-3 py-1"
              onClick={() => {
                if (state.deviceId) void cameraSession?.start(state.deviceId);
              }}
            >
              retry camera
            </button>
          </div>
        </Show>
        <Show when={state.cameraState === "loaded"}>
          <Show when={!previewProps.showVideo}>
            <div class="absolute w-full h-full top-0 bg-black" />
          </Show>
          <Show when={!previewProps.showVideo && !previewProps.showCanvas}>
            <div class="absolute w-full h-full top-0 bg-black flex flex-col gap-4 items-center justify-center">
              <div class="i-material-symbols:preview-off-rounded w-12 h-12" />
              <div>camera loaded but preview is hidden</div>
            </div>
          </Show>
        </Show>
        <canvas
          ref={setDetectResCanvasRef}
          class="absolute w-full h-auto top-0"
          classList={{
            hidden: !previewProps.showCanvas,
            "scale-x-[-1]": state.isMirrored,
          }}
        />
      </div>
    </Show>
  );

  return (
    <FaceDetectContext.Provider
      value={[
        state,
        {
          setDeviceId: (deviceId) => setState("deviceId", deviceId),
          retryCamera: () => {
            if (state.deviceId) void cameraSession?.start(state.deviceId);
          },
          toggleMirrored: () => setState("isMirrored", (prev) => !prev),
        },
        { DetectResultPreview },
      ]}
    >
      {props.children}
    </FaceDetectContext.Provider>
  );
};

export const useFaceDetect = () => useContext(FaceDetectContext);
