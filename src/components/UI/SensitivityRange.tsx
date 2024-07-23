import { Slider } from "@kobalte/core/slider";
import type { ComponentProps } from "solid-js";
import { type Component, splitProps } from "solid-js";

type Props = {
  label: string;
} & ComponentProps<typeof Slider> &
  (
    | {
        previewValue: number;
        minValue: number;
        maxValue: number;
      }
    | {
        previewValue: undefined;
      }
  );

const thumbClass =
  "block cursor-pointer w-16px h-16px bg-purple-600 rounded-full top--4px";

const Range: Component<Props> = (props) => {
  const [_, sliderProps] = splitProps(props, ["label", "previewValue"]);
  const previewPosition = () =>
    props.previewValue
      ? `calc(${
          ((props.previewValue - props.minValue) /
            (props.maxValue - props.minValue)) *
          100
        }% - 6px)`
      : "-6px";

  return (
    <Slider class="flex flex-col gap-2 w-full" {...sliderProps}>
      <div class="font-700 text-nowrap flex justify-between">
        <Slider.Label>{props.label}</Slider.Label>
        <Slider.ValueLabel />
      </div>
      <div class="w-full px-2">
        <Slider.Track class="relative rounded-full h-8px w-full bg-zinc">
          <Slider.Fill class="absolute bg-purple-600 h-full cursor-pointer" />
          <Slider.Thumb class={thumbClass}>
            <Slider.Input />
          </Slider.Thumb>
          <Slider.Thumb class={thumbClass}>
            <Slider.Input />
          </Slider.Thumb>
          <div
            class="absolute w-12px h-10px bg-zinc top-8px"
            style={{
              "clip-path": "polygon(50% 0, 100% 100%, 0 100%)",
              left: previewPosition(),
            }}
          />
        </Slider.Track>
      </div>
    </Slider>
  );
};

export default Range;
