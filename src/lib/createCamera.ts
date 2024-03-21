import {
  type Signal,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { isServer } from "solid-js/web";

const equalDeviceLists = (prev: MediaDeviceInfo[], next: MediaDeviceInfo[]) =>
  prev.length === next.length && prev.every((device) => next.includes(device));

export const createDevices = (): Signal<MediaDeviceInfo[]> => {
  if (isServer) {
    return [() => [], () => {}];
  }
  const [devices, setDevices] = createSignal<MediaDeviceInfo[]>([]);
  const enumerate = () => {
    navigator.mediaDevices.enumerateDevices().then(setDevices);
  };
  enumerate();
  navigator.mediaDevices.addEventListener("devicechange", enumerate);
  onCleanup(() =>
    navigator.mediaDevices.removeEventListener("devicechange", enumerate),
  );
  return [devices, setDevices];
};

export const createCameras = () => {
  if (isServer) {
    return () => [];
  }
  const [devices, setDevices] = createDevices();
  const cameras = createMemo(
    () => devices().filter((device) => device.kind === "videoinput"),
    [],
    {
      name: "cameras",
      equals: equalDeviceLists,
    },
  );

  onMount(() => {
    if (cameras()[0]?.deviceId === "") {
      // デバイスIDが空の場合はカメラ利用が許可されていないため、許可を求める
      // カメラ利用許可を求めるために一度カメラを起動する
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          // カメラを止める
          for (const track of stream.getTracks()) {
            track.stop();
          }

          // 利用許可を得ただけではdevicechangeイベントが発火しないため、手動で設定する
          navigator.mediaDevices.enumerateDevices().then(setDevices);
        })
        .catch((error) => {
          console.error(error);
        });

      // TODO: FireFoxではラベルが取得できないため、getUserMedia使用後にenumerateDevicesを実行する必要がありそう
    }
  });

  return cameras;
};
