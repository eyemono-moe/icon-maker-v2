import { RadioGroup } from "@kobalte/core";
import { For, type JSX, createUniqueId } from "solid-js";
import type { PartsComponent, SelectOptions } from "../Icon";

export type Options<K extends keyof SelectOptions> = {
  label: string;
  value: SelectOptions[K];
  component: PartsComponent;
}[];

type Props<K extends keyof SelectOptions> = {
  label: string;
  options: Options<keyof SelectOptions>;
  value: string;
  onChange: (value: SelectOptions[K]) => void;
  previewViewBox?: string;
};

const PartsSelect = <K extends keyof SelectOptions>(
  props: Props<K>,
): JSX.Element => {
  return (
    <RadioGroup.Root
      value={props.value}
      onChange={(value) => props.onChange(value as SelectOptions[K])}
    >
      <RadioGroup.Label>{props.label}</RadioGroup.Label>
      <div class="grid grid-cols-minmax-100px gap-1">
        <For each={props.options}>
          {(option) => {
            const id = createUniqueId();
            return (
              <RadioGroup.Item value={option.value}>
                <RadioGroup.ItemInput class="peer" />
                <RadioGroup.ItemControl class="relative b-2 rounded data-[checked]:b-purple peer-focus-visible:(outline outline-offset-1 outline-purple)">
                  <RadioGroup.ItemIndicator
                    forceMount
                    class="absolute top-1 left-1 w-8 h-8 not-[data-checked]:(i-material-symbols:radio-button-unchecked color-gray) data-[checked]:(i-material-symbols:radio-button-checked-outline color-purple)"
                  />
                  <RadioGroup.ItemLabel>
                    <svg viewBox={props.previewViewBox} class="w-full h-auto">
                      <title>{option.label}</title>
                      <g id={id} />
                      <option.component
                        mount={document.getElementById(id) ?? undefined}
                      />
                    </svg>
                  </RadioGroup.ItemLabel>
                </RadioGroup.ItemControl>
              </RadioGroup.Item>
            );
          }}
        </For>
      </div>
    </RadioGroup.Root>
  );
};

export default PartsSelect;
