import { Button, TextField, ToggleButton } from "@kobalte/core";
import { type Component, Show, createEffect, createSignal } from "solid-js";

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
  resetColor?: () => void;
};

const ColorField: Component<Props> = (props) => {
  const [isAuto, setIsAuto] = createSignal(props.color === undefined);
  const [selectedColor, setSelectedColor] = createSignal(
    !props.canEmpty ? props.color : props.color ?? props.fallbackColor,
  );

  createEffect(() => {
    if (props.canEmpty && isAuto()) {
      props.setColor(undefined);
    } else if (props.canEmpty && !isAuto()) {
      props.setColor(selectedColor());
    }
  });

  return (
    <div class="flex">
      <TextField.Root
        value={
          props.canEmpty ? props.color ?? props.fallbackColor : props.color
        }
        onChange={(v) => {
          if (props.canEmpty && isAuto()) {
            // computed color
            props.setColor(undefined);
          } else {
            // manual color
            props.setColor(v);
            setSelectedColor(v);
          }
        }}
        disabled={isAuto()}
        class="data-[disabled]:opacity-50"
      >
        <TextField.Label>{props.label}</TextField.Label>
        <TextField.Input type="color" />
        <Show when={props.resetColor}>
          <Button.Root
            onClick={props.resetColor}
            type="button"
            disabled={isAuto()}
          >
            Reset
          </Button.Root>
        </Show>
      </TextField.Root>
      <Show when={props.canEmpty}>
        <ToggleButton.Root pressed={isAuto()} onChange={setIsAuto}>
          {(state) => (
            <Show when={state.pressed()} fallback={"manual"}>
              auto
            </Show>
          )}
        </ToggleButton.Root>
      </Show>
    </div>
  );
};

export default ColorField;
