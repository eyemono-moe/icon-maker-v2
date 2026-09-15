import { createUndoHistory } from "@solid-primitives/history";
import {
  adjustHue,
  darken,
  desaturate,
  lighten,
  saturate,
  toHex,
} from "color2k";
import { replaceState } from "history-throttled";
import { type Setter, createSignal, onCleanup, useContext } from "solid-js";
import {
  type ParentComponent,
  createContext,
  createEffect,
  onMount,
} from "solid-js";
import { type SetStoreFunction, createStore, reconcile } from "solid-js/store";
import {
  createRandomIconState,
  randomFieldValue,
} from "~/domain/icon-randomizer";
import { type IconState, createDefaultIconState } from "~/domain/icon-state";
import { createIdenticonState, isValidIdenticonSeed } from "~/domain/identicon";
import { decodeIconState, encodeIconState } from "~/domain/icon-state-codec";
import type { Color } from "~/lib/color";
import {
  createDebouncedUrlPersistence,
  trackStore,
} from "~/lib/debounced-url-state";
import type {
  OmitEmptyObject,
  OmitNever,
  OmitUndefined,
  OptionalProps,
  Prettify,
  ResetStore,
} from "~/lib/utilityTypes";
type ComputedColor<T extends Record<string, unknown>> = Prettify<
  OmitEmptyObject<
    OmitUndefined<
      OmitNever<
        {
          readonly [
            O in keyof OptionalProps<T> as `computed${Capitalize<
              Extract<O, string>
            >}`
          ]-?: Color;
        } & {
          [P in keyof T]: T[P] extends Record<string, unknown>
            ? ComputedColor<T[P]>
            : never;
        }
      >
    >
  >
>;

export type IconColors = IconState;
export type ComputedColors = ComputedColor<IconState>;

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
  generateFromSeed: (seed: string) => Promise<void>;
  randomizeValue: ResetStore<Omit<IconColorsContextState, "accessories">>;
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

const defaultPlainColors = createDefaultIconState;

export const IconColorsProvider: ParentComponent<{
  params?: IconColors;
}> = (props) => {
  const [state, setState] = createStore<IconColorsContextState>(
    props.params ?? defaultPlainColors(),
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

  const replaceUrl = (serialized: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set("p", serialized);
    replaceState("", "", `?${searchParams.toString()}`);
  };
  const urlPersistence = createDebouncedUrlPersistence(
    () => encodeIconState(state),
    replaceUrl,
    150,
  );
  const saveToUrl = () => urlPersistence.saveNow();
  const loadFromUrl = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const p = url.searchParams.get("p");
    if (p) {
      const result = decodeIconState(p);
      if (result.ok) {
        setState(result.value);
      }
      return;
    }
    const seed = url.searchParams.get("seed");
    if (seed) void generateFromSeed(seed);
  };

  const toggleAutosave = () => {
    setConfigs("autosave", (prev) => !prev);
  };

  const randomize = () => {
    setState(reconcile(createRandomIconState()));
  };

  const generateFromSeed = async (seed: string) => {
    if (!isValidIdenticonSeed(seed)) return;
    setState(reconcile(await createIdenticonState(seed)));
  };

  const randomizeValue = <
    K1 extends Exclude<keyof IconColorsContextState, "accessories">,
    K2 extends keyof IconColorsContextState[K1],
  >(
    k1?: K1,
    k2?: K2,
  ) => {
    if (!k1) {
      randomize();
      return;
    }
    if (k2 === undefined) {
      const current = state[k1];
      if (typeof current === "string") {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        setState(k1, randomFieldValue(k1, undefined, current) as any);
      } else {
        setState(k1, createRandomIconState()[k1]);
      }
      return;
    }
    const current = (state[k1] as Record<K2, unknown>)[k2];
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    setState(k1, k2 as any, randomFieldValue(k1, k2, current) as any);
  };

  onMount(loadFromUrl);
  onCleanup(urlPersistence.cancel);
  createEffect(() => {
    if (typeof window === "undefined" || !configs.autosave) {
      urlPersistence.cancel();
      return;
    }
    trackStore(state);
    urlPersistence.schedule();
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
          generateFromSeed,
          randomizeValue,
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
    throw new Error("useIconColors must be used within a IconColorsProvider");
  return c;
};
