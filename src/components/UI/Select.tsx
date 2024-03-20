import { Select as KSelect } from "@kobalte/core";
import { type JSX, Show } from "solid-js";
import "../../assets/select.css";
import Button from "./Button";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value?: Option<T>;
  onChange: (value?: Option<T>) => void;
  options: Option<T>[];
  label: string;
  placeholder?: string;
  disallowEmptySelection?: boolean;
  onReset?: () => void;
};

const Select = <T extends string>(props: Props<T>): JSX.Element => {
  return (
    <KSelect.Root<Option<T>>
      value={props.value}
      onChange={props.onChange}
      options={props.options}
      optionValue="value"
      optionTextValue="label"
      placeholder={props.placeholder}
      disallowEmptySelection={props.disallowEmptySelection}
      itemComponent={(itemProps) => (
        <KSelect.Item
          item={itemProps.item}
          class="rounded flex items-center justify-between p-2 data-[highlighted]:(outline-none bg-zinc-200) data-[selected]:(bg-purple-600! c-white!)"
        >
          <KSelect.ItemLabel>{itemProps.item.rawValue.label}</KSelect.ItemLabel>
          <KSelect.ItemIndicator>
            <div class="i-material-symbols:check-small-rounded w-6 h-6" />
          </KSelect.ItemIndicator>
        </KSelect.Item>
      )}
      class="flex flex-col gap-1 w-full"
    >
      <KSelect.Label class="font-700 text-nowrap">{props.label}</KSelect.Label>
      <div class="flex items-center gap-2 overflow-hidden">
        <KSelect.Trigger class="inline-flex items-center justify-between w-full rounded p-2 b-2 bg-white">
          <KSelect.Value<Option<T>> class="data-[placeholder-shown]:c-zinc">
            {(state) => state.selectedOption().label}
          </KSelect.Value>
          <KSelect.Icon class="data-[expanded]:rotate-180 transition-transform-250">
            <div class="i-material-symbols:arrow-drop-down-rounded w-6 h-6 c-zinc" />
          </KSelect.Icon>
        </KSelect.Trigger>
        <Show when={props.onReset}>
          <Button variant="secondary" onClick={props.onReset} type="button">
            Reset
          </Button>
        </Show>
      </div>
      <KSelect.Portal>
        <KSelect.Content class="bg-white b-1 rounded shadow origin-[--kb-select-content-transform-origin] animate-[contentHide] animate-duration-200 data-[expanded]:(animate-[contentShow] animate-duration-200)">
          <KSelect.Listbox class="max-h-360px p-2 overflow-y-auto" />
        </KSelect.Content>
      </KSelect.Portal>
    </KSelect.Root>
  );
};

export default Select;
