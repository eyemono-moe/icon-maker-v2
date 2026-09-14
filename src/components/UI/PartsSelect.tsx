import { RadioGroup } from "@ark-ui/solid/radio-group";
import { For, type JSX, Show, Suspense, createUniqueId } from "solid-js";
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
  onRandom?: () => void;
};

const PartsSelect = <T extends string>(props: Props<T>): JSX.Element => {
  return (
    <RadioGroup.Root
      value={props.value}
      onValueChange={(details) => props.onChange(details.value as T)}
      class="flex flex-col gap-1"
    >
      <div class="flex gap-2 items-center">
        <RadioGroup.Label class="font-700 text-nowrap">
          {props.label}
        </RadioGroup.Label>
        <Button variant="secondary" type="button" onClick={props.onReset}>
          Reset
        </Button>
        <Show when={props.onRandom}>
          <Button variant="secondary" type="button" onClick={props.onRandom}>
            Random
          </Button>
        </Show>
      </div>
      <div class="grid grid-cols-minmax-100px gap-1">
        <For each={props.options}>
          {(option) => {
            const id = createUniqueId();
            return (
              <RadioGroup.Item value={option.value}>
                <RadioGroup.ItemHiddenInput
                  class="peer"
                  aria-label={option.label}
                />
                <RadioGroup.ItemControl class="b-2 rounded data-[state=checked]:b-purple-600 peer-focus-visible:(outline-2 outline-solid outline-purple-600 outline-offset-2)">
                  <RadioGroup.ItemText class="cursor-pointer w-full h-auto aspect-square block">
                    <Suspense fallback={<LoadingSpinner />}>
                      <svg viewBox={props.previewViewBox} class="w-full h-auto">
                        <title>{option.label}</title>
                        <g id={id} />
                        <option.component
                          mount={document.getElementById(id) ?? undefined}
                        />
                      </svg>
                    </Suspense>
                  </RadioGroup.ItemText>
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
