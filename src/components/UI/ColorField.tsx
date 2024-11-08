import { Checkbox } from "@kobalte/core/checkbox";
import { TextField } from "@kobalte/core/text-field";
import { type Component, Show, createEffect, createSignal } from "solid-js";
import type { JSX } from "solid-js";
import { useIconColors } from "~/context/iconColors";
import Button from "./Button";

type Props = (
  | {
      setColor: (color: string) => void;
      canEmpty?: false;
      color: string;
    }
  | {
      setColor: (color: string | undefined) => void;
      canEmpty: true;
      color?: string;
      fallbackColor: string;
    }
) & {
  label: string;
  onReset?: () => void;
};

const ColorField: Component<Props> = (props) => {
  const [_, { setTrackHistory }] = useIconColors();
  const [isAuto, setIsAuto] = createSignal(props.color === undefined);
  const [selectedColor, setSelectedColor] = createSignal(
    !props.canEmpty ? props.color : (props.color ?? props.fallbackColor),
  );

  createEffect(() => {
    if (props.canEmpty && isAuto()) {
      props.setColor(undefined);
    } else if (props.canEmpty && !isAuto()) {
      props.setColor(selectedColor());
    }
  });

  const handleReset = () => {
    props.onReset?.();
    setSelectedColor(
      !props.canEmpty ? props.color : (props.color ?? props.fallbackColor),
    );
  };

  return (
    <TextField
      value={
        props.canEmpty ? (props.color ?? props.fallbackColor) : props.color
      }
      onChange={(v) => {
        setTrackHistory(false);
        props.setColor(v);
        setSelectedColor(v);
      }}
      disabled={isAuto()}
      class="parent grid gap-1 data-[disabled]:grid-rows-[max-content_0fr] grid-rows-[max-content_1fr] transition-all-100 w-full"
    >
      <div class="flex items-center gap-4">
        <TextField.Label class="font-700 text-nowrap">
          {props.label}
        </TextField.Label>
        <Show when={props.canEmpty}>
          <Checkbox
            checked={isAuto()}
            onChange={setIsAuto}
            class="flex items-center"
          >
            <Checkbox.Input class="peer" />
            <Checkbox.Control class="group rounded peer-focus-visible:outline">
              <Checkbox.Indicator forceMount class="parent">
                <div class="parent-not-[[data-checked]]:i-material-symbols:check-box-outline-blank parent-[[data-checked]]:(i-material-symbols:check-box c-purple-600) w-6! h-6! cursor-pointer" />
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label class="text-nowrap cursor-pointer">
              Set automatically
            </Checkbox.Label>
          </Checkbox>
        </Show>
      </div>
      <div class="flex items-center gap-2 overflow-hidden">
        <TextField.Input
          type="color"
          class="w-full h-8 rounded"
          onChange={(
            e: Parameters<JSX.ChangeEventHandler<HTMLInputElement, Event>>[0],
          ) => {
            // historyに一度だけ保存するためにonChangeでsetColorを呼ぶ
            setTrackHistory(true);
            props.setColor(e.currentTarget.value);
          }}
        />
        <Show when={props.onReset}>
          <Button
            variant="secondary"
            onClick={handleReset}
            type="button"
            disabled={isAuto()}
          >
            Reset
          </Button>
        </Show>
      </div>
    </TextField>
  );
};

export default ColorField;
