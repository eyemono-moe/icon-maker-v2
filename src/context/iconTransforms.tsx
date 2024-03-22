import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import pkg from "lz-string";
import { createEffect, useContext } from "solid-js";
import { type ParentComponent, createContext } from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";
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

type MinMax = [min: number, max: number];

type RecursivelyApplyMinMax<T> = T extends Record<string, unknown>
  ? {
      [P in keyof T]: RecursivelyApplyMinMax<T[P]>;
    }
  : T extends number
    ? MinMax
    : T;

type IconTransformMinMax = RecursivelyApplyMinMax<IconTransforms>;

export type IconTransformsContextState = {
  rawTransform: IconTransforms;
  minMax: IconTransformMinMax;
  isSyncing: boolean;
};

export type IconTransformsContextActions = {
  setTransform: SetStoreFunction<IconTransformsContextState>;
  toggleSyncing: () => void;
};

export type IconTransformsContextValue = [
  transforms: IconTransformsContextState,
  actions: IconTransformsContextActions,
  mappedTransforms: IconTransforms,
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

const mapMinMax = (
  value: number,
  input: MinMax,
  output: MinMax = [0, 1],
  clump = true,
): number => {
  let div = input[1] - input[0];
  if (div === 0) {
    div = Number.MIN_VALUE;
  }
  const slope = (output[1] - output[0]) / div;
  const result = output[0] + slope * (value - input[0]);
  if (clump) {
    return Math.min(output[1], Math.max(output[0], result));
  }
  return result;
};

export const IconTransformsProvider: ParentComponent<{
  params?: IconTransforms;
}> = (props) => {
  const [state, setState] = createStore<IconTransformsContextState>({
    rawTransform: defaultPlainTransforms(),
    minMax: {
      eyes: {
        position: {
          x: [-0.9, 0.9],
          y: [-0.9, 0.1],
        },
        close: [0.2, 0.55],
      },
      mouth: {
        open: [0, 1],
      },
      head: {
        position: {
          x: [-1, 1],
          y: [-1, 1],
        },
        rotation: [-180, 180],
      },
    },
    isSyncing: false,
  });

  const [faceDetect] = useFaceDetect() ?? [];

  const mappedTransforms: IconTransforms = {
    eyes: {
      position: {
        get x() {
          return state.isSyncing
            ? mapMinMax(
                state.rawTransform.eyes.position.x,
                state.minMax.eyes.position.x,
                [-1, 1],
              )
            : defaultPlainTransforms().eyes.position.x;
        },
        get y() {
          return state.isSyncing
            ? mapMinMax(
                state.rawTransform.eyes.position.y,
                state.minMax.eyes.position.y,
                [-1, 1],
              )
            : defaultPlainTransforms().eyes.position.y;
        },
      },
      get close() {
        return state.isSyncing
          ? mapMinMax(state.rawTransform.eyes.close, state.minMax.eyes.close)
          : defaultPlainTransforms().eyes.close;
      },
    },
    mouth: {
      get open() {
        return state.isSyncing
          ? mapMinMax(state.rawTransform.mouth.open, state.minMax.mouth.open)
          : defaultPlainTransforms().mouth.open;
      },
    },
    head: {
      position: {
        get x() {
          return state.isSyncing
            ? mapMinMax(
                state.rawTransform.head.position.x,
                state.minMax.head.position.x,
                [-1, 1],
                false,
              )
            : defaultPlainTransforms().head.position.x;
        },
        get y() {
          return state.isSyncing
            ? mapMinMax(
                state.rawTransform.head.position.y,
                state.minMax.head.position.y,
                [-1, 1],
                false,
              )
            : defaultPlainTransforms().head.position.x;
        },
      },
      get rotation() {
        return state.isSyncing
          ? mapMinMax(
              state.rawTransform.head.rotation,
              state.minMax.head.rotation,
              [-180, 180],
              false,
            )
          : defaultPlainTransforms().head.rotation;
      },
    },
  };

  createEffect(() => {
    if (faceDetect?.result !== undefined) {
      const headTransformRaw = calcHeadTransform(
        faceDetect.result?.facialTransformationMatrixes?.[0],
        faceDetect.isMirrored,
      );

      setState("rawTransform", "head", "position", "x", headTransformRaw.x);
      setState("rawTransform", "head", "position", "y", headTransformRaw.y);
      setState("rawTransform", "head", "rotation", headTransformRaw.rotate);

      const eyesTransformRaw = calcEyesTransform(
        faceDetect.result?.faceBlendshapes[0]?.categories,
        faceDetect.isMirrored,
      );

      setState("rawTransform", "eyes", "position", "x", eyesTransformRaw.x);
      setState("rawTransform", "eyes", "position", "y", eyesTransformRaw.y);
      setState("rawTransform", "eyes", "close", eyesTransformRaw.close);
    }
  });

  createEffect(() => {
    setState("isSyncing", faceDetect?.cameraState === "loaded");
  });

  return (
    <IconTransformsContext.Provider
      value={[
        state,
        {
          setTransform: setState,
          toggleSyncing: () => setState("isSyncing", (prev) => !prev),
        },
        mappedTransforms,
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
