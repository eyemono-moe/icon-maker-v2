import { type Accessor, createMemo, createSignal, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export type CameraDevicesStatus =
  | "idle"
  | "enumerating"
  | "permission-required"
  | "ready"
  | "denied"
  | "unsupported"
  | "error";

export type CameraDevicesState = {
  status: CameraDevicesStatus;
  devices: MediaDeviceInfo[];
  error?: string;
};

export type CameraDevices = {
  state: Accessor<CameraDevicesState>;
  cameras: Accessor<MediaDeviceInfo[]>;
  retry: () => void;
};

const errorMessage = (cause: unknown) =>
  cause instanceof Error ? cause.message : String(cause);

const isPermissionDenied = (cause: unknown) =>
  cause instanceof DOMException &&
  (cause.name === "NotAllowedError" || cause.name === "SecurityError");

export const createCameras = (): CameraDevices => {
  if (
    isServer ||
    !navigator.mediaDevices?.enumerateDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    const state = () => ({
      status: "unsupported" as const,
      devices: [],
      error: "Camera devices are not supported by this browser.",
    });
    return { state, cameras: () => [], retry: () => {} };
  }

  const mediaDevices = navigator.mediaDevices;
  const [state, setState] = createSignal<CameraDevicesState>({
    status: "idle",
    devices: [],
  });
  let requestVersion = 0;
  let permissionAttempted = false;

  const requestCameraPermission = async (version: number) => {
    try {
      const stream = await mediaDevices.getUserMedia({ video: true });
      for (const track of stream.getTracks()) track.stop();
      if (version === requestVersion) await enumerate(false);
    } catch (cause) {
      if (version !== requestVersion) return;
      setState({
        status: isPermissionDenied(cause) ? "denied" : "error",
        devices: [],
        error: errorMessage(cause),
      });
      console.error("Camera permission request failed", cause);
    }
  };

  const enumerate = async (requestPermission: boolean) => {
    const version = ++requestVersion;
    setState((previous) => ({
      status: "enumerating",
      devices: previous.devices,
    }));

    try {
      const devices = await mediaDevices.enumerateDevices();
      if (version !== requestVersion) return;
      const cameras = devices.filter((device) => device.kind === "videoinput");
      const needsPermission = cameras.some((camera) => !camera.deviceId);

      if (needsPermission && requestPermission && !permissionAttempted) {
        permissionAttempted = true;
        setState({ status: "permission-required", devices });
        await requestCameraPermission(version);
        return;
      }

      if (needsPermission) {
        setState({
          status: "error",
          devices,
          error:
            "Camera permission was granted, but camera IDs are unavailable.",
        });
        return;
      }

      setState({ status: "ready", devices });
    } catch (cause) {
      if (version !== requestVersion) return;
      setState({
        status: "error",
        devices: [],
        error: errorMessage(cause),
      });
      console.error("Camera enumeration failed", cause);
    }
  };

  const retry = () => {
    permissionAttempted = false;
    void enumerate(true);
  };
  const handleDeviceChange = () => {
    permissionAttempted = false;
    void enumerate(true);
  };

  void enumerate(true);
  mediaDevices.addEventListener("devicechange", handleDeviceChange);
  onCleanup(() => {
    requestVersion += 1;
    mediaDevices.removeEventListener("devicechange", handleDeviceChange);
  });

  return {
    state,
    cameras: createMemo(() =>
      state().devices.filter(
        (device) => device.kind === "videoinput" && Boolean(device.deviceId),
      ),
    ),
    retry,
  };
};
