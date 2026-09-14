import { Slider } from "@ark-ui/solid/slider";
import type { Component } from "solid-js";

type MinMax = [min: number, max: number];

type Props = {
  label: string;
  value: MinMax;
  onChange: (value: MinMax) => void;
  getValueLabel?: (details: { values: MinMax }) => string;
  minValue: number;
  maxValue: number;
  step: number;
  minStepsBetweenThumbs?: number;
  previewValue?: number;
};

const thumbClass =
  "block cursor-pointer w-16px h-16px bg-purple-600 rounded-full top--4px focus-visible:(outline-2 outline-solid outline-purple-600 outline-offset-2)";

const Range: Component<Props> = (props) => {
  const previewPosition = () =>
    props.previewValue !== undefined
      ? `calc(${((props.previewValue - props.minValue) / (props.maxValue - props.minValue)) * 100}% - 6px)`
      : "-6px";

  return (
    <Slider.Root
      class="flex flex-col gap-2 w-full"
      value={[...props.value] as MinMax}
      onValueChange={(details) => props.onChange(details.value as MinMax)}
      min={props.minValue}
      max={props.maxValue}
      step={props.step}
      minStepsBetweenThumbs={props.minStepsBetweenThumbs}
    >
      <div class="font-700 text-nowrap flex justify-between">
        <Slider.Label>{props.label}</Slider.Label>
        <Slider.ValueText>
          {props.getValueLabel?.({ values: props.value }) ??
            props.value.join(" - ")}
        </Slider.ValueText>
      </div>
      <Slider.Control class="w-full px-2">
        <Slider.Track class="relative rounded-full h-8px w-full bg-zinc">
          <Slider.Range class="absolute bg-purple-600 h-full cursor-pointer" />
          <Slider.Thumb index={0} class={thumbClass}>
            <Slider.HiddenInput />
          </Slider.Thumb>
          <Slider.Thumb index={1} class={thumbClass}>
            <Slider.HiddenInput />
          </Slider.Thumb>
          <div
            class="absolute w-12px h-10px bg-zinc top-8px"
            style={{
              "clip-path": "polygon(50% 0, 100% 100%, 0 100%)",
              left: previewPosition(),
            }}
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
};

export default Range;
