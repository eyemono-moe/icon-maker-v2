import { Checkbox } from "@ark-ui/solid/checkbox";
import { Field } from "@ark-ui/solid/field";
import {
  type Component,
  Show,
  createEffect,
  createSignal,
  createUniqueId,
} from "solid-js";
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
  const inputId = createUniqueId();
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
    <div
      class="parent grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 transition-all-100 w-full"
      classList={{
        "grid-rows-[max-content_0fr]": isAuto(),
        "grid-rows-[max-content_1fr]": !isAuto(),
      }}
    >
      <Show when={props.canEmpty}>
        <Checkbox.Root
          checked={isAuto()}
          onCheckedChange={(details) => setIsAuto(details.checked === true)}
          class="flex items-center row-start-1 col-start-2"
        >
          <Checkbox.HiddenInput class="peer" />
          <Checkbox.Control class="inline-flex items-center justify-center w-6 h-6 b-2 rounded peer-focus-visible:(outline-2 outline-solid outline-purple-600 outline-offset-2) data-[state=checked]:(bg-purple-600 b-purple-600 c-white)">
            <Checkbox.Indicator>
              <div class="i-material-symbols:check-small-rounded w-5 h-5" />
            </Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label class="text-nowrap cursor-pointer">
            Set automatically
          </Checkbox.Label>
        </Checkbox.Root>
      </Show>
      <Field.Root class="contents">
        <Field.Label
          for={inputId}
          class="font-700 text-nowrap row-start-1 col-start-1"
        >
          {props.label}
        </Field.Label>
        <div class="flex items-center gap-2 overflow-hidden row-start-2 col-span-2">
          <Field.Input
            id={inputId}
            type="color"
            disabled={isAuto()}
            value={
              props.canEmpty
                ? (props.color ?? props.fallbackColor)
                : props.color
            }
            class="w-full h-8 rounded"
            onInput={(e) => {
              const color = e.currentTarget.value;
              setTrackHistory(false);
              props.setColor(color);
              setSelectedColor(color);
            }}
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
      </Field.Root>
    </div>
  );
};

export default ColorField;
