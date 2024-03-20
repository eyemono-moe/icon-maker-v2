import pkg from "lz-string";
import { useContext } from "solid-js";
import { type ParentComponent, createContext } from "solid-js";
import { createStore } from "solid-js/store";

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

export const IconTransformsProvider: ParentComponent<{
  params?: IconTransforms;
}> = (props) => {
  const [state, setState] = createStore<IconTransformsContextState>({
    transform: defaultPlainTransforms(),
    isSyncing: false,
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
