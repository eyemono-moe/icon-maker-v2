import {
  adjustHue,
  darken,
  desaturate,
  lighten,
  saturate,
  toHex,
} from "color2k";
import pkg from "lz-string";
import { useContext } from "solid-js";
import {
  type ParentComponent,
  createContext,
  createEffect,
  onMount,
} from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";
import type { eyesOptions } from "~/components/parts/eyes";
import type { hairOptions } from "~/components/parts/hair";
import type { mouthOptions } from "~/components/parts/mouth";
import type { Color } from "~/lib/color";
import type {
  OmitEmptyObject,
  OmitNever,
  OmitUndefined,
  OptionalProps,
  Prettify,
  ResetStore,
} from "~/lib/utilityTypes";
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

type ComputedColor<T extends Record<string, unknown>> = Prettify<
  OmitEmptyObject<
    OmitUndefined<
      OmitNever<
        {
          readonly [O in keyof OptionalProps<T> as `computed${Capitalize<
            Extract<O, string>
          >}`]-?: Color;
        } & {
          [P in keyof T]: T[P] extends Record<string, unknown>
            ? ComputedColor<T[P]>
            : never;
        }
      >
    >
  >
>;

type IconParamsWithoutComputed = {
  hair: {
    type: (typeof hairOptions)[number]["value"];
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

export type IconParams = IconParamsWithoutComputed;
export type ComputedColors = ComputedColor<IconParamsWithoutComputed>;

export type IconParamsContextState = IconParams;

export type IconParamsContextConfigs = {
  autosave: boolean;
};

export type IconParamsContextActions = {
  setProps: SetStoreFunction<IconParamsContextState>;
  computeColors: ComputedColors;
  reset: ResetStore<IconParamsContextState>;
  saveToUrl: () => void;
  loadFromUrl: () => void;
  toggleAutosave: () => void;
};

export type IconParamsContextValue = [
  params: IconParamsContextState,
  actions: IconParamsContextActions,
  config: IconParamsContextConfigs,
];

export const IconParamsContext = createContext<IconParamsContextValue>();

const defaultIconParams: IconParams = {
  hair: {
    baseColor: "#9940BB",
    type: "short",
  },
  eyes: {
    pupilBaseColor: "#EE2266",
    open: 1,
    position: { x: 0, y: 0 },
    type: "default",
  },
  accessories: [],
  background: "#BBEE66",
  eyebrows: {
    type: "default",
  },
  head: {
    type: "default",
    position: { x: 0, y: 0 },
    rotation: 0,
    baseColor: "#FFCCCC",
  },
  mouth: {
    type: "default",
    open: 0,
  },
};

// need to deep clone
const defaultPlainParams = () =>
  JSON.parse(JSON.stringify(defaultIconParams)) as IconParams;

export const parseParams = (params: string): IconParams => {
  return JSON.parse(decompressFromEncodedURIComponent(params)) as IconParams;
};

export const IconParamsProvider: ParentComponent<{
  params?: IconParams;
}> = (props) => {
  const [state, setState] = createStore<IconParamsContextState>(
    defaultPlainParams(),
  );
  const [configs, setConfigs] = createStore<IconParamsContextConfigs>({
    autosave: true,
  });

  const computeColors: ComputedColors = {
    hair: {
      get computedHighlightColor() {
        return toHex(
          lighten(saturate(adjustHue(state.hair.baseColor, 260), 0.4), 0.4),
        );
      },
      get computedStrokeColor() {
        return toHex(
          darken(saturate(adjustHue(state.hair.baseColor, 32), 0.3), 0.3),
        );
      },
    },
    eyes: {
      get computedPupilSecondaryColor() {
        return toHex(
          darken(
            desaturate(adjustHue(state.eyes.pupilBaseColor, 320), 0.2),
            0.3,
          ),
        );
      },
      get computedEyeWhiteColor() {
        return defaultPlainParams().eyes.eyeWhiteColor ?? "#FFFFFF";
      },
      get computedShadowColor() {
        return defaultPlainParams().eyes.shadowColor ?? "#D5D5FF";
      },
      get computedEyelashesColor() {
        return state.hair.strokeColor ?? computeColors.hair.computedStrokeColor;
      },
    },
    eyebrows: {
      get computedBaseColor() {
        return state.hair.strokeColor ?? computeColors.hair.computedStrokeColor;
      },
    },
    mouth: {
      get computedStrokeColor() {
        return state.head.strokeColor ?? computeColors.head.computedStrokeColor;
      },
      get computedTeethColor() {
        return defaultPlainParams().mouth.teethColor ?? "#ffffff";
      },
      get computedInsideColor() {
        return defaultPlainParams().mouth.insideColor ?? "#DD4466";
      },
    },
    head: {
      get computedShadowColor() {
        return toHex(darken(adjustHue(state.head.baseColor, 10), 0.1));
      },
      get computedStrokeColor() {
        return toHex(
          darken(desaturate(adjustHue(state.head.baseColor, 336), 0.3), 0.65),
        );
      },
    },
  };

  // TODO: 可変長引数に対応する
  const reset = <
    K1 extends keyof IconParamsContextState,
    K2 extends keyof IconParamsContextState[K1],
  >(
    k1?: K1,
    k2?: K2,
  ) => {
    console.log(k1, k2);
    if (k1) {
      if (k2) {
        console.log(k1, k2, defaultPlainParams()[k1][k2]);
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        setState(k1, k2 as any, defaultPlainParams()[k1][k2]);
      } else {
        setState(k1, defaultPlainParams()[k1]);
      }
    } else {
      setState(defaultPlainParams());
    }
  };

  const saveToUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set(
      "p",
      compressToEncodedURIComponent(JSON.stringify(state)),
    );
    window.history.replaceState(null, "", url.toString());
  };
  const loadFromUrl = () => {
    const url = new URL(window.location.href);
    const p = url.searchParams.get("p");
    if (p) {
      const data = parseParams(p);
      setState(data);
    }
  };

  const toggleAutosave = () => {
    setConfigs("autosave", (prev) => !prev);
  };

  onMount(loadFromUrl);
  createEffect(() => {
    if (configs.autosave) saveToUrl();
  });

  return (
    <IconParamsContext.Provider
      value={[
        state,
        {
          setProps: setState,
          computeColors,
          saveToUrl,
          loadFromUrl,
          reset,
          toggleAutosave,
        },
        configs,
      ]}
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
