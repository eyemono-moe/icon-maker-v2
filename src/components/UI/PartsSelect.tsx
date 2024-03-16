import { RadioGroup } from "@kobalte/core";
import { For, type JSX, Suspense, createUniqueId } from "solid-js";
import type { PartsComponent } from "../Icon";

export type Options<T extends string = ""> = {
  label: string;
  value: T;
  component: PartsComponent;
}[];

type Props<T extends string> = {
  label: string;
  options: Options<T>;
  value: string;
  onChange: (value: T) => void;
  previewViewBox?: string;
};

const PartsSelect = <T extends string>(props: Props<T>): JSX.Element => {
  return (
    <RadioGroup.Root
      value={props.value}
      onChange={(value) => props.onChange(value as T)}
      class="flex flex-col"
    >
      <RadioGroup.Label class="font-700">{props.label}</RadioGroup.Label>
      <div class="grid grid-cols-minmax-100px gap-1">
        <For each={props.options}>
          {(option) => {
            const id = createUniqueId();
            return (
              <RadioGroup.Item value={option.value}>
                <RadioGroup.ItemInput class="peer" />
                <RadioGroup.ItemControl class="b-2 rounded data-[checked]:b-purple-600 peer-focus-visible:(outline outline-offset-1)">
                  <RadioGroup.ItemLabel class="cursor-pointer">
                    <svg viewBox={props.previewViewBox} class="w-full h-auto">
                      <title>{option.label}</title>
                      <g id={id} />
                      <Suspense>
                        <option.component
                          mount={document.getElementById(id) ?? undefined}
                        />
                      </Suspense>
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
