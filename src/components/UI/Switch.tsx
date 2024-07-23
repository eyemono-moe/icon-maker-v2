import { Switch as KSwitch } from "@kobalte/core/switch";
import type { Component } from "solid-js";
import type { ComponentProps } from "solid-js";

type Props = {
  label: string;
} & ComponentProps<typeof KSwitch>;

const Switch: Component<Props> = (props) => {
  return (
    <KSwitch class="flex justify-between items-center w-full" {...props}>
      <KSwitch.Label class="font-700 text-nowrap cursor-pointer">
        {props.label}
      </KSwitch.Label>
      <KSwitch.Input class="peer" />
      <KSwitch.Control class="inline-flex items-center w-54px b-1 rounded-full p-2px peer-focus-visible:(outline outline-offset-2) bg-zinc data-[checked]:bg-purple-600 transition-background-color-100 cursor-pointer">
        <KSwitch.Thumb class="w-24px aspect-square rounded-full bg-white transition-transform-100 data-[checked]:translate-x-full" />
      </KSwitch.Control>
    </KSwitch>
  );
};

export default Switch;
