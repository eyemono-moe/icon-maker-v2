import { type Component, For, Match, Switch } from "solid-js";
import { type IconParamsContextState, useIconParams } from "~/context/icon";
import type { Options } from "./UI/PartsSelect";
import Background from "./parts/background";
import { eyebrowsOptions } from "./parts/eyebrows";
import { eyesOptions } from "./parts/eyes";
import { hairOptions } from "./parts/hair";
import { headOptions } from "./parts/head";
import { mouthOptions } from "./parts/mouth";

export const iconSvgId = "icon-svg";

export type SelectOptions = {
  [K in keyof IconParamsContextState as IconParamsContextState[K] extends {
    type: string;
  }
    ? K
    : never]: IconParamsContextState[K] extends {
    type: string;
  }
    ? IconParamsContextState[K]["type"]
    : never;
};

export type PartsComponent = Component<{ mount?: Node }>;

const Parts = <K extends keyof SelectOptions>(props: {
  parts: K;
  options: Options<SelectOptions[K]>;
  defaultParts: SelectOptions[K];
}) => {
  const [iconParams] = useIconParams();
  const Fallback =
    props.options.find((o) => o.value === props.defaultParts)?.component ??
    (() => <></>);

  return (
    <Switch fallback={<Fallback />}>
      <For each={props.options}>
        {(option) => (
          <Match when={iconParams[props.parts].type === option.value}>
            <option.component />
          </Match>
        )}
      </For>
    </Switch>
  );
};

const Icon: Component = () => {
  return (
    <>
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        class="w-full aspect-square h-auto"
        id={iconSvgId}
      >
        <title>eyemono.moe icon</title>
        <g id="background-target" />
        <g id="accessory-bottom-target" />
        <g id="hair-back-target" />
        <g id="neck-target" />
        <g id="head-target" />
        <g id="accessory-skin-target" />
        <g id="hair-shadow-target" />
        <g id="eye-lower-target" />
        <g id="hair-front-target" />
        <g id="eye-upper-target" />
        <g id="mouth-target" />
        <g id="eyebrow-target" />
        <g id="accessory-top-target" />
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
      </svg>
    </>
  );
};

export default Icon;
