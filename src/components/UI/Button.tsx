import { Button as KButton } from "@kobalte/core";
import type { ButtonRootProps } from "@kobalte/core/dist/types/button";
import { type ParentComponent, mergeProps, splitProps } from "solid-js";

type Props = {
  variant?: "primary" | "secondary";
  fill?: boolean;
} & ButtonRootProps;

const Button: ParentComponent<Props> = (props) => {
  const mergedProps = mergeProps({ variant: "primary" }, props);
  const [addedProps, kobalteProps] = splitProps(mergedProps, [
    "variant",
    "fill",
  ]);

  return (
    <KButton.Root
      {...kobalteProps}
      class="font-700 py-1 px-2 rounded"
      classList={{
        "bg-purple-400 enabled:hover:bg-purple-500 text-white":
          addedProps.variant === "primary",
        "bg-zinc-200 enabled:hover:bg-zinc-300":
          addedProps.variant === "secondary",
        "w-full": addedProps.fill,
      }}
    >
      {props.children}
    </KButton.Root>
  );
};

export default Button;
