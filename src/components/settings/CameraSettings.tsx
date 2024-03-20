import { createCameras } from "@solid-primitives/devices";
import { type Component, createSignal } from "solid-js";
import { useCamera } from "~/context/camera";
import { useIconTransforms } from "~/context/iconTransforms";
import Select from "../UI/Select";
import Switch from "../UI/Switch";

const CameraSettings: Component = () => {
  const [transform, actions, { DetectResultPreview }] = useIconTransforms();
  const [state, { setDeviceId }] = useCamera();

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
        label="show video"
        checked={showVideo()}
        onChange={setShowVideo}
      />
      <Switch
        label="show face mesh"
        checked={showCanvas()}
        onChange={setShowCanvas}
      />
    </>
  );
};

export default CameraSettings;
