import type { JSX, ParentComponent } from "solid-js";
import { mergeProps, splitProps } from "solid-js";

type Props = {
  variant?: "primary" | "secondary";
  fill?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: ParentComponent<Props> = (props) => {
  const mergedProps = mergeProps({ variant: "primary" }, props);
  const [addedProps, buttonProps] = splitProps(mergedProps, [
    "variant",
    "fill",
  ]);

  return (
    <button
      {...buttonProps}
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
    </button>
  );
};

export default Button;
