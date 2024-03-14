import {
  type ParentComponent,
  createContext,
  createMemo,
  useContext,
} from "solid-js";
import { type SetStoreFunction, createStore } from "solid-js/store";
import type { eyesOptions } from "~/components/parts/eyes";
import type { mouthOptions } from "~/components/parts/mouth";
import type { Color } from "~/lib/color";

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

type IconParams = WithComputedColor<{
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
}>;

export type IconParamsContextState = IconParams;

export type IconParamsContextActions = {
  setProps: SetStoreFunction<IconParamsContextState>;
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
    type: "default",
  },
};

// need to deep clone
export const defaultParams = JSON.parse(
  JSON.stringify(defaultIconParams),
) as IconParams;

export const IconParamsProvider: ParentComponent = (props) => {
  const [state, setState] = createStore(defaultIconParams);

  computedHairHighlightColor = createMemo<Color>(() => "#DDFFFD");
  computedHairStrokeColor = createMemo<Color>(() => state.hair.baseColor); // todo: gen from hair base color

  computedEyebrowsBaseColor = createMemo<Color>(
    () => state.hair.strokeColor ?? state.hair.computedStrokeColor,
  );

  computedEyePupilSecondaryColor = createMemo<Color>(() => "#551155"); // todo: darken
  computedEyeEyeWhiteColor = createMemo<Color>(() => "#FFFFFF"); // todo: gen form pupil color
  computedEyeShadowColor = createMemo<Color>(() => "#D5D5FF"); // todo: gen form eye white color
  computedEyeEyelashesColor = createMemo<Color>(
    () => state.hair.strokeColor ?? state.hair.computedStrokeColor,
  );

  computedTeethColor = createMemo<Color>(() => "#ffffff");
  computedInsideColor = createMemo<Color>(() => "#DD4466"); // todo: gen from skin color

  computedHeadShadowColor = createMemo<Color>(() => "#FFAA99"); // todo: gen from skin color
  computedHeadStrokeColor = createMemo<Color>(() => "#661133"); // todo: gen from skin color
  computedMouthStrokeColor = createMemo<Color>(
    () => state.head.strokeColor ?? state.head.computedStrokeColor,
  ); // todo: gen

  return (
    <IconParamsContext.Provider value={[state, { setProps: setState }]}>
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
