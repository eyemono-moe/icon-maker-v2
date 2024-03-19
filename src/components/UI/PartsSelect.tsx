import { RadioGroup } from "@kobalte/core";
import { For, type JSX, Suspense, createUniqueId } from "solid-js";
import type { PartsComponent } from "../Icon";
import Button from "./Button";
import LoadingSpinner from "./Loading";

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
  onReset?: () => void;
};

const PartsSelect = <T extends string>(props: Props<T>): JSX.Element => {
  return (
    <RadioGroup.Root
      value={props.value}
      onChange={(value) => props.onChange(value as T)}
      class="flex flex-col gap-1"
    >
      <div class="flex gap-2 items-center">
        <RadioGroup.Label class="font-700 text-nowrap">
          {props.label}
        </RadioGroup.Label>
        <Button variant="secondary" type="button" onClick={props.onReset}>
          Reset
        </Button>
      </div>
      <div class="grid grid-cols-minmax-100px gap-1">
        <For each={props.options}>
          {(option) => {
            const id = createUniqueId();
            return (
              <RadioGroup.Item value={option.value}>
                <RadioGroup.ItemInput class="peer" />
                <RadioGroup.ItemControl class="b-2 rounded data-[checked]:b-purple-600 peer-focus-visible:(outline outline-offset-1)">
                  <RadioGroup.ItemLabel class="cursor-pointer w-full h-auto aspect-square block">
                    <Suspense fallback={<LoadingSpinner />}>
                      <svg viewBox={props.previewViewBox} class="w-full h-auto">
                        <title>{option.label}</title>
                        <g id={id} />
                        <option.component
                          mount={document.getElementById(id) ?? undefined}
                        />
                      </svg>
                    </Suspense>
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
