import { type Component, createSignal } from "solid-js";
import { useFaceDetect } from "~/context/faceDetect";
import { useIconTransforms } from "~/context/iconTransforms";
import { createCameras } from "~/lib/createCamera";
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

  const cameras = createCameras();
  const cameraOptions = () =>
    cameras().map((camera) => ({
      value: camera.deviceId,
      label: camera.label,
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
        // @ts-expect-error
        onChange={(v: [number, number]) =>
          setTransform("minMax", "eyes", "position", "x", v)
        }
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
        // @ts-expect-error
        onChange={(v: [number, number]) =>
          setTransform("minMax", "eyes", "position", "y", v)
        }
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
        // @ts-expect-error
        onChange={(v: [number, number]) =>
          setTransform("minMax", "eyes", "close", v)
        }
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
