import { type Component, For, Match, Suspense, Switch } from "solid-js";
import {
  type IconColorsContextState,
  useIconColors,
} from "~/context/iconColors";
import { PortalTarget } from "../context/ssrPortal";
import type { Options } from "./UI/PartsSelect";
import Background from "./parts/background";
import { eyebrowsOptions } from "./parts/eyebrows";
import { eyesOptions } from "./parts/eyes";
import { hairOptions } from "./parts/hair";
import { headOptions } from "./parts/head";
import { mouthOptions } from "./parts/mouth";

export const iconSvgId = "icon-svg";

export type SelectOptions = {
  [K in keyof IconColorsContextState as IconColorsContextState[K] extends {
    type: string;
  }
    ? K
    : never]: IconColorsContextState[K] extends {
    type: string;
  }
    ? IconColorsContextState[K]["type"]
    : never;
};

export type PartsComponent = Component<{ mount?: Node }>;

const Parts = <K extends keyof SelectOptions>(props: {
  parts: K;
  options: Options<SelectOptions[K]>;
  defaultParts: SelectOptions[K];
}) => {
  const [iconColors] = useIconColors();
  const Fallback =
    props.options.find((o) => o.value === props.defaultParts)?.component ??
    (() => <></>);

  return (
    <Switch fallback={<Fallback />}>
      <For each={props.options}>
        {(option) => (
          <Match when={iconColors[props.parts].type === option.value}>
            <Suspense>
              <option.component />
            </Suspense>
          </Match>
        )}
      </For>
    </Switch>
  );
};

const Icon: Component = () => {
  return (
    <svg
      viewBox="0 0 400 400"
      width="400"
      height="400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      id={iconSvgId}
    >
      <title>eyemono.moe icon</title>
      <Background />
      <Parts
        parts="eyebrows"
        defaultParts="default"
        options={eyebrowsOptions}
      />
      <Parts parts="eyes" defaultParts="default" options={eyesOptions} />
      <Parts parts="hair" defaultParts="short" options={hairOptions} />
      <Parts parts="head" defaultParts="default" options={headOptions} />
      <Parts parts="mouth" defaultParts="default" options={mouthOptions} />
      <PortalTarget id="background-target" />
      <PortalTarget id="accessory-bottom-target" />
      <PortalTarget id="hair-back-target" />
      <PortalTarget id="neck-target" />
      <PortalTarget id="head-target" />
      <PortalTarget id="accessory-skin-target" />
      <PortalTarget id="hair-shadow-target" />
      <PortalTarget id="nose-target" />
      <PortalTarget id="eye-lower-target" />
      <PortalTarget id="hair-front-target" />
      <PortalTarget id="eye-upper-target" />
      <PortalTarget id="mouth-target" />
      <PortalTarget id="eyebrow-target" />
      <PortalTarget id="accessory-top-target" />
    </svg>
  );
};

export default Icon;
