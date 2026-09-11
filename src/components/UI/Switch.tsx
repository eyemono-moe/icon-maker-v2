import { Switch as ArkSwitch } from "@ark-ui/solid/switch";
import type { Component } from "solid-js";

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Switch: Component<Props> = (props) => {
  return (
    <ArkSwitch.Root
      class="flex justify-between items-center w-full"
      checked={props.checked}
      onCheckedChange={(details) => props.onChange(details.checked)}
    >
      <ArkSwitch.Label class="font-700 text-nowrap cursor-pointer">
        {props.label}
      </ArkSwitch.Label>
      <ArkSwitch.HiddenInput class="peer" />
      <ArkSwitch.Control class="inline-flex items-center w-54px b-1 rounded-full p-2px peer-focus-visible:(outline outline-offset-2) bg-zinc data-[state=checked]:bg-purple-600 transition-background-color-100 cursor-pointer">
        <ArkSwitch.Thumb class="w-24px aspect-square rounded-full bg-white transition-transform-100 data-[state=checked]:translate-x-full" />
      </ArkSwitch.Control>
    </ArkSwitch.Root>
  );
};

export default Switch;
