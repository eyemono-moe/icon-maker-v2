import { Button as KButton } from "@kobalte/core/button";
import type { ComponentProps } from "solid-js";
import { type ParentComponent, mergeProps, splitProps } from "solid-js";

type Props = {
  variant?: "primary" | "secondary";
  fill?: boolean;
} & ComponentProps<typeof KButton>;

const Button: ParentComponent<Props> = (props) => {
  const mergedProps = mergeProps({ variant: "primary" }, props);
  const [addedProps, kobalteProps] = splitProps(mergedProps, [
    "variant",
    "fill",
  ]);

  return (
    <KButton
      {...kobalteProps}
      class="font-700 py-1 px-2 rounded"
      classList={{
        "bg-purple-600 enabled:hover:bg-purple-500 text-white":
          addedProps.variant === "primary",
        "bg-zinc-200 enabled:hover:bg-zinc-300":
          addedProps.variant === "secondary",
        "w-full": addedProps.fill,
      }}
    >
      {props.children}
    </KButton>
  );
};

export default Button;
