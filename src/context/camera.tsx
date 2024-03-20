import { type ParentComponent, createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

type CameraContextState = {
  deviceId?: string;
};

type CameraContextActions = {
  setDeviceId: (deviceId?: string) => void;
};

type CameraContextValue = [
  state: CameraContextState,
  actions: CameraContextActions,
];

const CameraContext = createContext<CameraContextValue>();

export const CameraProvider: ParentComponent = (props) => {
  const [state, setState] = createStore<CameraContextState>({
    deviceId: undefined,
  });

  const actions = {
    setDeviceId: (deviceId?: string) => setState("deviceId", deviceId),
  };

  return (
    <CameraContext.Provider value={[state, actions]}>
      {props.children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};
