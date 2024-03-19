import { createUndoHistory } from "@solid-primitives/history";
import {
  adjustHue,
  darken,
  desaturate,
  lighten,
  saturate,
  toHex,
} from "color2k";
import pkg from "lz-string";
import { type Setter, createSignal, useContext } from "solid-js";
import {
  type ParentComponent,
  createContext,
  createEffect,
  onMount,
} from "solid-js";
import { type SetStoreFunction, createStore, reconcile } from "solid-js/store";
import { eyebrowsOptions } from "~/components/parts/eyebrows";
import { eyesOptions } from "~/components/parts/eyes";
import { hairOptions } from "~/components/parts/hair";
import { headOptions } from "~/components/parts/head";
import { mouthOptions } from "~/components/parts/mouth";
import type { Color } from "~/lib/color";
import { choice, randomHSL } from "~/lib/random";
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

type IconColorsWithoutComputed = {
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
  };
  eyebrows: {
    type: (typeof eyebrowsOptions)[number]["value"];
    baseColor?: Color;
  };
  mouth: {
    type: (typeof mouthOptions)[number]["value"];
    strokeColor?: Color;
    teethColor?: Color;
    insideColor?: Color;
  };
  accessories: Accessory[];
  head: {
    type: (typeof headOptions)[number]["value"];
    baseColor: Color;
    strokeColor?: Color;
    shadowColor?: Color;
  };
  background: Color;
};

export type IconColors = IconColorsWithoutComputed;
export type ComputedColors = ComputedColor<IconColorsWithoutComputed>;

type IconTransform = {
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

export type IconColorsContextState = IconColors;

export type IconColorsContextConfigs = {
  autosave: boolean;
};

export type IconColorsContextActions = {
  setColors: SetStoreFunction<IconColorsContextState>;
  computeColors: ComputedColors;
  reset: ResetStore<IconColorsContextState>;
  saveToUrl: () => void;
  loadFromUrl: () => void;
  toggleAutosave: () => void;
  randomize: () => void;
  // history
  setTrackHistory: Setter<boolean>;
  undo: () => void;
  redo: () => void;
};

export type IconColorsContextValue = [
  colors: IconColorsContextState,
  actions: IconColorsContextActions,
  config: IconColorsContextConfigs,
];

export const IconColorsContext = createContext<IconColorsContextValue>();

const defaultIconColors: IconColors = {
  hair: {
    baseColor: "#9940BB",
    type: "short",
  },
  eyes: {
    pupilBaseColor: "#EE2266",
    type: "default",
  },
  accessories: [],
  background: "#BBEE66",
  eyebrows: {
    type: "default",
  },
  head: {
    type: "default",
    baseColor: "#FFCCCC",
  },
  mouth: {
    type: "default",
  },
};

// need to deep clone
const defaultPlainColors = () =>
  JSON.parse(JSON.stringify(defaultIconColors)) as IconColors;

export const parseColors = (params: string): IconColors => {
  return JSON.parse(decompressFromEncodedURIComponent(params)) as IconColors;
};

export const IconColorsProvider: ParentComponent<{
  params?: IconColors;
}> = (props) => {
  const [state, setState] = createStore<IconColorsContextState>(
    defaultPlainColors(),
  );
  const [configs, setConfigs] = createStore<IconColorsContextConfigs>({
    autosave: true,
  });

  // see: https://github.com/solidjs-community/solid-primitives/tree/main/packages/history
  const [trackHistory, setTrackHistory] = createSignal(true);
  const history = createUndoHistory(
    () => {
      if (trackHistory()) {
        const copy = JSON.parse(JSON.stringify(state));
        return () => setState(reconcile(copy));
      }
    },
    {
      limit: 30,
    },
  );

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
        return defaultPlainColors().eyes.eyeWhiteColor ?? "#FFFFFF";
      },
      get computedShadowColor() {
        return defaultPlainColors().eyes.shadowColor ?? "#D5D5FF";
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
        return defaultPlainColors().mouth.teethColor ?? "#ffffff";
      },
      get computedInsideColor() {
        return defaultPlainColors().mouth.insideColor ?? "#DD4466";
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
    K1 extends keyof IconColorsContextState,
    K2 extends keyof IconColorsContextState[K1],
  >(
    k1?: K1,
    k2?: K2,
  ) => {
    if (k1) {
      if (k2) {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        setState(k1, k2 as any, defaultPlainColors()[k1][k2]);
      } else {
        setState(k1, defaultPlainColors()[k1]);
      }
    } else {
      setState(reconcile(defaultPlainColors()));
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
      const data = parseColors(p);
      setState(data);
    }
  };

  const toggleAutosave = () => {
    setConfigs("autosave", (prev) => !prev);
  };

  const randomize = () => {
    reset();
    setState("hair", "type", choice(hairOptions).value);
    setState("hair", "baseColor", randomHSL([0, 360], [0, 1], [0.05, 1]));
    setState("eyes", "type", choice(eyesOptions).value);
    setState("eyes", "pupilBaseColor", randomHSL([0, 360], [0, 1], [0, 1]));
    setState("eyebrows", "type", choice(eyebrowsOptions).value);
    setState("mouth", "type", choice(mouthOptions).value);
    setState("head", "type", choice(headOptions).value);
    setState("head", "baseColor", randomHSL([0, 25], [0.5, 1], [0.6, 0.9]));
    setState("background", randomHSL([0, 360], [0.2, 1], [0.2, 0.9]));
  };

  onMount(loadFromUrl);
  createEffect(() => {
    if (configs.autosave) saveToUrl();
  });

  return (
    <IconColorsContext.Provider
      value={[
        state,
        {
          setColors: setState,
          computeColors,
          saveToUrl,
          loadFromUrl,
          reset,
          toggleAutosave,
          randomize,
          setTrackHistory,
          undo: history.undo,
          redo: history.redo,
        },
        configs,
      ]}
    >
      {props.children}
    </IconColorsContext.Provider>
  );
};

export const useIconColors = () => {
  const c = useContext(IconColorsContext);
  if (!c)
    throw new Error("useIconParams must be used within a IconParamsProvider");
  return c;
};
