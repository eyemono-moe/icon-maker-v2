import {
  adjustHue,
  darken,
  desaturate,
  lighten,
  saturate,
  toHex,
} from "color2k";
import pkg from "lz-string";
import {
  type ParentComponent,
  createContext,
  createEffect,
  createMemo,
  onMount,
  useContext,
} from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";
import type { eyesOptions } from "~/components/parts/eyes";
import type { mouthOptions } from "~/components/parts/mouth";
import type { Color } from "~/lib/color";
const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  pkg;

type Accessory =
  | {
      type: "glasses";
      colors: [Color];
    }
  | {
      type: "blush";
      colors: [Color];
    }
  | {
      type: "catEars";
      colors: [Color, Color];
    };

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type OptionalProps<T> = T extends Record<string, unknown>
  ? {
      [P in keyof T as undefined | Color extends T[P] ? P : never]: T[P];
    }
  : never;

type WithComputedColor<T extends Record<string, unknown>> = Prettify<
  {
    readonly [O in keyof OptionalProps<T> as `computed${Capitalize<
      Extract<O, string>
    >}`]-?: Color;
  } & {
    [P in keyof T]: T[P] extends Record<string, unknown>
      ? WithComputedColor<T[P]>
      : T[P];
  }
>;

type IconParamsWithoutComputed = {
  hair: {
    type: "short";
    baseColor: Color;
    strokeColor?: Color;
    highlightColor?: Color;
  };
  eyes: {
    type: (typeof eyesOptions)[number]["value"];
    pupilBaseColor: Color;
    pupilSecondaryColor?: Color;
    eyeWhiteColor?: Color;
    shadowColor?: Color;
    eyelashesColor?: Color;
    position: {
      /** -1.0 ~ 1.0 */
      x: number;
      /** -1.0 ~ 1.0 */
      y: number;
    };
    /** 0.0 ~ 1.0 */
    open: number;
  };
  eyebrows: {
    type: "default" | "komari" | "angry";
    baseColor?: Color;
  };
  mouth: {
    type: (typeof mouthOptions)[number]["value"];
    strokeColor?: Color;
    teethColor?: Color;
    insideColor?: Color;
    /** 0.0 ~ 1.0 */
    open: number;
  };
  accessories: Accessory[];
  head: {
    type: "default";
    position: {
      /** 0 mean center */
      x: number;
      /** 0 mean center */
      y: number;
    };
    /** 0 mean no rotation */
    rotation: number;
    baseColor: Color;
    strokeColor?: Color;
    shadowColor?: Color;
  };
  background: Color;
};

export type IconParams = WithComputedColor<IconParamsWithoutComputed>;

export type IconParamsContextState = IconParams;

export type IconParamsContextActions = {
  setProps: SetStoreFunction<IconParamsContextState>;
  saveToUrl: () => void;
  loadFromUrl: () => void;
  reset: () => void;
};

export type IconParamsContextValue = [
  state: IconParamsContextState,
  actions: IconParamsContextActions,
];

export const IconParamsContext = createContext<IconParamsContextValue>();

let computedHairHighlightColor: () => Color = () => "";
let computedHairStrokeColor: () => Color = () => "";

let computedEyebrowsBaseColor: () => Color = () => "";

let computedEyePupilSecondaryColor: () => Color = () => "";
let computedEyeEyeWhiteColor: () => Color = () => "";
let computedEyeShadowColor: () => Color = () => "";
let computedEyeEyelashesColor: () => Color = () => "";

let computedMouthStrokeColor: () => Color = () => "";
let computedTeethColor: () => Color = () => "";
let computedInsideColor: () => Color = () => "";

let computedHeadShadowColor: () => Color = () => "";
let computedHeadStrokeColor: () => Color = () => "";

const defaultIconParams: IconParams = {
  hair: {
    baseColor: "#9940BB",
    type: "short",
    get computedHighlightColor() {
      return computedHairHighlightColor();
    },
    get computedStrokeColor() {
      return computedHairStrokeColor();
    },
  },
  eyes: {
    pupilBaseColor: "#EE2266",
    get computedPupilSecondaryColor() {
      return computedEyePupilSecondaryColor();
    },
    get computedEyeWhiteColor() {
      return computedEyeEyeWhiteColor();
    },
    get computedShadowColor() {
      return computedEyeShadowColor();
    },
    get computedEyelashesColor() {
      return computedEyeEyelashesColor();
    },
    open: 1,
    position: { x: 0, y: 0 },
    type: "default",
  },
  accessories: [],
  background: "#BBEE66",
  eyebrows: {
    get computedBaseColor() {
      return computedEyebrowsBaseColor();
    },
    type: "default",
  },
  head: {
    type: "default",
    position: { x: 0, y: 0 },
    rotation: 0,
    baseColor: "#FFCCCC",
    get computedShadowColor() {
      return computedHeadShadowColor();
    },
    get computedStrokeColor() {
      return computedHeadStrokeColor();
    },
  },
  mouth: {
    type: "default",
    get computedStrokeColor() {
      return computedMouthStrokeColor();
    },
    get computedTeethColor() {
      return computedTeethColor();
    },
    get computedInsideColor() {
      return computedInsideColor();
    },
    open: 0,
  },
};

// need to deep clone
export const defaultPlainParams = JSON.parse(
  JSON.stringify(defaultIconParams),
) as IconParams;

const removeComputedReplacer = (key: string, value: unknown) => {
  if (key.startsWith("computed")) return undefined;
  return value;
};
const defaultParamsWithoutComputed = JSON.parse(
  JSON.stringify(defaultPlainParams, removeComputedReplacer),
) as IconParamsWithoutComputed;

export const parseParams = (params: string): IconParams => {
  return JSON.parse(decompressFromEncodedURIComponent(params)) as IconParams;
};

export const IconParamsProvider: ParentComponent<{
  params?: IconParams;
}> = (props) => {
  const [state, setState] = createStore(defaultIconParams);

  const updateState = (data: IconParams) => {
    type Entries<T> = (keyof T extends infer U
      ? U extends keyof T
        ? [U, T[U]]
        : never
      : never)[];
    // objectをそのまま代入するとcomputedが消えるので(浅くマージされる)、entriesで代入する
    (Object.entries(data) as Entries<IconParams>).map(([k, v]) => {
      setState(k, v);
    });
  };

  if (props.params) {
    updateState(props.params);
  } else {
    updateState(defaultIconParams);
  }

  const reset = () => {
    updateState(defaultParamsWithoutComputed as IconParams);
  };

  computedHairHighlightColor = createMemo<Color>(() =>
    toHex(lighten(saturate(adjustHue(state.hair.baseColor, 260), 0.4), 0.4)),
  );
  computedHairStrokeColor = createMemo<Color>(() =>
    toHex(darken(saturate(adjustHue(state.hair.baseColor, 32), 0.3), 0.3)),
  );
  computedEyePupilSecondaryColor = createMemo<Color>(() =>
    toHex(
      darken(desaturate(adjustHue(state.eyes.pupilBaseColor, 320), 0.2), 0.3),
    ),
  );
  computedEyeEyeWhiteColor = createMemo<Color>(() => "#FFFFFF");
  computedEyeShadowColor = createMemo<Color>(() => "#D5D5FF");
  computedTeethColor = createMemo<Color>(() => "#ffffff");
  computedInsideColor = createMemo<Color>(() =>
    toHex(darken(desaturate(adjustHue(state.head.baseColor, 347), 0.3), 0.3)),
  );
  computedHeadShadowColor = createMemo<Color>(() =>
    toHex(darken(adjustHue(state.head.baseColor, 10), 0.1)),
  );
  computedHeadStrokeColor = createMemo<Color>(() =>
    toHex(darken(desaturate(adjustHue(state.head.baseColor, 336), 0.3), 0.65)),
  );
  computedEyebrowsBaseColor = createMemo<Color>(
    () => state.hair.strokeColor ?? state.hair.computedStrokeColor,
  );
  computedEyeEyelashesColor = createMemo<Color>(
    () => state.hair.strokeColor ?? state.hair.computedStrokeColor,
  );
  computedMouthStrokeColor = createMemo<Color>(
    () => state.head.strokeColor ?? state.head.computedStrokeColor,
  );

  const saveToUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set(
      "p",
      compressToEncodedURIComponent(
        JSON.stringify(state, removeComputedReplacer),
      ),
    );
    window.history.replaceState(null, "", url.toString());
  };
  const loadFromUrl = () => {
    const url = new URL(window.location.href);
    const p = url.searchParams.get("p");
    if (p) {
      const data = parseParams(p);
      updateState(data);
    }
  };

  onMount(loadFromUrl);
  createEffect(saveToUrl);

  return (
    <IconParamsContext.Provider
      value={[state, { setProps: setState, saveToUrl, loadFromUrl, reset }]}
    >
      {props.children}
    </IconParamsContext.Provider>
  );
};

export const useIconParams = () => {
  const c = useContext(IconParamsContext);
  if (!c)
    throw new Error("useIconParams must be used within a IconParamsProvider");
  return c;
};
