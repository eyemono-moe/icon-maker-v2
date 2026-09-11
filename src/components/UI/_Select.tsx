import { Select, createListCollection } from "@ark-ui/solid/select";
import { For, type JSX, Show, createMemo } from "solid-js";
import { Portal } from "solid-js/web";
import Button from "./Button";
import "../../assets/select.css";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value?: Option<T>;
  onChange: (value: Option<T> | null) => void;
  options: Option<T>[];
  label: string;
  placeholder?: string;
  disallowEmptySelection?: boolean;
  onReset?: () => void;
};

const _Select = <T extends string>(props: Props<T>): JSX.Element => {
  const collection = createMemo(() =>
    createListCollection({
      items: props.options,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
    }),
  );
  const controlledValue = createMemo(() =>
    props.value === undefined ? {} : { value: [props.value.value] },
  );

  return (
    <Select.Root
      {...controlledValue()}
      collection={collection()}
      onValueChange={(details) => props.onChange(details.items[0] ?? null)}
      deselectable={!props.disallowEmptySelection}
      positioning={{ sameWidth: true }}
      class="flex flex-col gap-1 w-full"
    >
      <Select.Label class="font-700 text-nowrap">{props.label}</Select.Label>
      <div class="flex items-center gap-2 overflow-hidden">
        <Select.Control class="w-full">
          <Select.Trigger class="inline-flex items-center justify-between w-full rounded p-2 b-2 bg-white focus-visible:(outline-2 outline-solid outline-purple-600 outline-offset-2)">
            <Select.ValueText
              placeholder={props.placeholder}
              class="data-[placeholder-shown]:c-zinc"
            />
            <Select.Indicator class="data-[state=open]:rotate-180 transition-transform-250">
              <div class="i-material-symbols:arrow-drop-down-rounded w-6 h-6 c-zinc" />
            </Select.Indicator>
          </Select.Trigger>
        </Select.Control>
        <Show when={props.onReset}>
          <Button variant="secondary" onClick={props.onReset} type="button">
            Reset
          </Button>
        </Show>
      </div>
      <Select.HiddenSelect />
      <Portal>
        <Select.Positioner>
          <Select.Content class="bg-white b-1 rounded shadow origin-[--transform-origin] animate-[contentHide] animate-duration-200 data-[state=open]:(animate-[contentShow] animate-duration-200)">
            <Select.List class="max-h-360px p-2 overflow-y-auto">
              <For each={props.options}>
                {(option) => (
                  <Select.Item
                    item={option}
                    class="rounded flex items-center justify-between p-2 data-[highlighted]:(outline-none bg-zinc-200) data-[state=checked]:(bg-purple-600! c-white!)"
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>
                      <div class="i-material-symbols:check-small-rounded w-6 h-6" />
                    </Select.ItemIndicator>
                  </Select.Item>
                )}
              </For>
            </Select.List>
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

export default _Select;
