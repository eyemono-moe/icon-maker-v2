import {
  For,
  type JSX,
  type ParentComponent,
  Show,
  createContext,
  createRenderEffect,
  useContext,
} from "solid-js";
import { Portal } from "solid-js/web";

export const SsrPortalContext = createContext<SsrPortalContextType>();

interface SsrPortalProps {
  id: string;
  children: JSX.Element;
}

export interface SsrPortalContextType {
  addPortal: (portal: SsrPortalProps) => void;
  portals: Map<string, JSX.Element[]>;
}

export const SsrPortalProvider: ParentComponent = (props) => {
  const portals = new Map<string, JSX.Element[]>();

  const addPortal = (portal: SsrPortalProps) => {
    portals.set(portal.id, [
      ...(portals.get(portal.id) ?? []),
      portal.children,
    ]);
  };

  return (
    <SsrPortalContext.Provider value={{ addPortal, portals }}>
      {props.children}
    </SsrPortalContext.Provider>
  );
};

export const SsrPortal: ParentComponent<
  {
    target: string;
  } & Parameters<typeof Portal>["0"]
> = (props) => {
  const c = useContext(SsrPortalContext);

  createRenderEffect(() => {
    c?.addPortal({ id: props.target, children: props.children });
  });

  return (
    <Show when={!c}>
      <Portal {...props}>{props.children}</Portal>
    </Show>
  );
};

export const PortalTarget: ParentComponent<JSX.GSVGAttributes<SVGGElement>> = (
  props,
) => {
  if (props.id === undefined) {
    throw new Error("id is required");
  }

  const c = useContext(SsrPortalContext);

  if (c) {
    const { portals } = c;
    const portal = portals.get(props.id);

    if (portal) {
      return (
        <g {...props}>
          <For each={portal}>{(p) => p}</For>
        </g>
      );
    }
  }

  return <g {...props} />;
};
