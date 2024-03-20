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

export const IconTransformsProvider: ParentComponent<{
  params?: IconTransforms;
}> = (props) => {
  const [state, setState] = createStore<IconTransformsContextState>({
    transform: defaultPlainTransforms(),
    isSyncing: false,
  });

  const [faceDetect] = useFaceDetect() ?? [];

  createEffect(() => {
    if (faceDetect?.result) {
      const headTransform = calcHeadTransform(
        faceDetect.result?.facialTransformationMatrixes?.[0],
        faceDetect.isMirrored,
      );

      setState("transform", "head", "position", "x", headTransform.x);
      setState("transform", "head", "position", "y", headTransform.y);
      setState("transform", "head", "rotation", headTransform.rotate);
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
