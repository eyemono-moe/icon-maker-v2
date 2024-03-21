import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import pkg from "lz-string";
import { createEffect, useContext } from "solid-js";
import { type ParentComponent, createContext } from "solid-js";
import { createStore } from "solid-js/store";
import { useFaceDetect } from "./faceDetect";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  pkg;

type IconTransforms = {
  eyes: {
    position: {
      /** -1.0 ~ 1.0, positive mean outside */
      x: number;
      /** -1.0 ~ 1.0, positive mean upside */
      y: number;
    };
    /** 0.0 ~ 1.0, 1.0 mean close */
    close: number;
  };
  mouth: {
    /** 0.0 ~ 1.0 */
    open: number;
  };
  head: {
    position: {
      /** 0 mean center, positive mean right */
      x: number;
      /** 0 mean center, positive mean up */
      y: number;
    };
    /** 0 mean no rotation */
    rotation: number;
  };
};

export type IconTransformsContextState = {
  transform: IconTransforms;
  isSyncing: boolean;
};

export type IconTransformsContextActions = {
  toggleSyncing: () => void;
};

export type IconTransformsContextValue = [
  transforms: IconTransformsContextState,
  actions: IconTransformsContextActions,
];

export const IconTransformsContext =
  createContext<IconTransformsContextValue>();

const defaultIconTransforms: IconTransforms = {
  eyes: {
    position: {
      x: 0,
      y: 0,
    },
    close: 0,
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

const calcHeadTransform = (
  matrix?: FaceLandmarkerResult["facialTransformationMatrixes"][number],
  mirror = false,
): {
  x: number;
  y: number;
  rotate: number;
} => {
  if (matrix === undefined || matrix.rows !== 4 || matrix.columns !== 4) {
    return { x: 0, y: 0, rotate: 0 };
  }
  const x = matrix.data[12] / matrix.data[15];
  const y = matrix.data[13] / matrix.data[15];
  const rotate = Math.atan2(matrix.data[4], matrix.data[0]) * (180 / Math.PI);

  if (mirror) {
    return { x: -x, y, rotate: -rotate };
  }

  return { x, y, rotate };
};

const getBlendShape = (
  categories: FaceLandmarkerResult["faceBlendshapes"][number]["categories"],
  name: string,
) => {
  return categories.find((category) => category.categoryName === name);
};

const calcEyesTransform = (
  categories?: FaceLandmarkerResult["faceBlendshapes"][number]["categories"],
  mirror = false,
): {
  x: number;
  y: number;
  close: number;
} => {
  if (categories === undefined) {
    return { x: 0, y: 0, close: 0 };
  }
  if (!mirror) {
    const eil = getBlendShape(categories, "eyeLookInLeft")?.score ?? 0;
    const eol = getBlendShape(categories, "eyeLookOutLeft")?.score ?? 0;
    const eul = getBlendShape(categories, "eyeLookUpLeft")?.score ?? 0;
    const edl = getBlendShape(categories, "eyeLookDownLeft")?.score ?? 0;
    const x = eol - eil;
    const y = eul - edl;
    const close = getBlendShape(categories, "eyeBlinkLeft")?.score ?? 0;

    return { x, y, close };
  }
  const eir = getBlendShape(categories, "eyeLookInRight")?.score ?? 0;
  const eor = getBlendShape(categories, "eyeLookOutRight")?.score ?? 0;
  const eur = getBlendShape(categories, "eyeLookUpRight")?.score ?? 0;
  const edr = getBlendShape(categories, "eyeLookDownRight")?.score ?? 0;

  const x = eor - eir;
  const y = eur - edr;
  const close = getBlendShape(categories, "eyeBlinkRight")?.score ?? 0;

  return { x, y, close };
};

export const IconTransformsProvider: ParentComponent<{
  params?: IconTransforms;
}> = (props) => {
  const [state, setState] = createStore<IconTransformsContextState>({
    transform: defaultPlainTransforms(),
    isSyncing: false,
  });

  const [faceDetect] = useFaceDetect() ?? [];

  createEffect(() => {
    if (faceDetect?.result !== undefined) {
      const headTransform = calcHeadTransform(
        faceDetect.result?.facialTransformationMatrixes?.[0],
        faceDetect.isMirrored,
      );

      setState("transform", "head", "position", "x", headTransform.x);
      setState("transform", "head", "position", "y", headTransform.y);
      setState("transform", "head", "rotation", headTransform.rotate);

      const eyesTransform = calcEyesTransform(
        faceDetect.result?.faceBlendshapes[0]?.categories,
        faceDetect.isMirrored,
      );

      setState("transform", "eyes", "position", "x", eyesTransform.x);
      setState("transform", "eyes", "position", "y", eyesTransform.y);
      setState("transform", "eyes", "close", eyesTransform.close);
    }
  });

  return (
    <IconTransformsContext.Provider
      value={[
        state,
        {
          toggleSyncing: () => setState("isSyncing", (prev) => !prev),
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
