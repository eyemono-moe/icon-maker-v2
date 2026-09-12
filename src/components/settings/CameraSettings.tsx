import { type Component, createSignal } from "solid-js";
import { useFaceDetect } from "~/context/faceDetect";
import { useIconTransforms } from "~/context/iconTransforms";
import { createCameras } from "~/lib/createCamera";
import Button from "../UI/Button";
import Select from "../UI/Select";
import Range from "../UI/SensitivityRange";
import Switch from "../UI/Switch";

const CameraSettings: Component = () => {
  const [
    detectState,
    { setDeviceId, toggleMirrored },
    { DetectResultPreview },
  ] =
    useFaceDetect() ??
    (() => {
      throw new Error("FaceDetectContext not found");
    })();

  const [transforms, { setTransform }] = useIconTransforms();

  const [showVideo, setShowVideo] = createSignal(false);
  const [showCanvas, setShowCanvas] = createSignal(false);

  const cameraDevices = createCameras();
  const cameraOptions = () =>
    cameraDevices.cameras().map((camera, index) => ({
      value: camera.deviceId,
      label: camera.label || `Camera ${index + 1}`,
    }));

  return (
    <>
      <Select
        options={cameraOptions()}
        onChange={(camera) => {
          setDeviceId(camera?.value);
        }}
        label="camera input"
        placeholder="select camera"
      />
      {(cameraDevices.state().status === "denied" ||
        cameraDevices.state().status === "error" ||
        cameraDevices.state().status === "unsupported") && (
        <div class="rounded b-1 b-red-600 p-2 c-red-800" role="alert">
          <div>
            camera {cameraDevices.state().status}: {cameraDevices.state().error}
          </div>
          {cameraDevices.state().status !== "unsupported" && (
            <Button
              type="button"
              variant="secondary"
              onClick={cameraDevices.retry}
            >
              retry camera access
            </Button>
          )}
        </div>
      )}
      <DetectResultPreview showVideo={showVideo()} showCanvas={showCanvas()} />
      <Switch
        label="show video input"
        checked={showVideo()}
        onChange={setShowVideo}
      />
      <Switch
        label="show face mesh"
        checked={showCanvas()}
        onChange={setShowCanvas}
      />
      <Switch
        label="mirror video"
        checked={detectState.isMirrored}
        onChange={toggleMirrored}
      />
      <Range
        label="eye X axis sensitivity"
        value={transforms.minMax.eyes.position.x}
        onChange={(v) => setTransform("minMax", "eyes", "position", "x", v)}
        getValueLabel={(v) => {
          return `left: ${v.values[0]} - right: ${v.values[1]}`;
        }}
        minValue={-1}
        maxValue={1}
        step={0.01}
        minStepsBetweenThumbs={0.01}
        previewValue={transforms.rawTransform.eyes.position.x}
      />
      <Range
        label="eye Y axis sensitivity"
        value={transforms.minMax.eyes.position.y}
        onChange={(v) => setTransform("minMax", "eyes", "position", "y", v)}
        getValueLabel={(v) => {
          return `down: ${v.values[0]} - up: ${v.values[1]}`;
        }}
        minValue={-1}
        maxValue={1}
        step={0.01}
        minStepsBetweenThumbs={0.01}
        previewValue={transforms.rawTransform.eyes.position.y}
      />
      <Range
        label="eye close sensitivity"
        value={transforms.minMax.eyes.close}
        onChange={(v) => setTransform("minMax", "eyes", "close", v)}
        getValueLabel={(v) => {
          return `open: ${v.values[0]} - close: ${v.values[1]}`;
        }}
        minValue={0}
        maxValue={1}
        step={0.01}
        minStepsBetweenThumbs={0.01}
        previewValue={transforms.rawTransform.eyes.close}
      />
    </>
  );
};

export default CameraSettings;
