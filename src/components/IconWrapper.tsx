import type { Component, Setter } from "solid-js";
import { useIconColors } from "~/context/iconColors";
import Icon from "./Icon";

const IconWrapper: Component<{
  isFull: boolean;
  setIsFull: Setter<boolean>;
}> = (props) => {
  const [state] = useIconColors();
  return (
    <div
      class="relative grid place-items-center w-full h-full overflow-hidden min-w-0 min-h-0 children-[svg]:(w-[100cqmin] aspect-suqare h-auto)"
      style={{
        background: state.background,
        "container-type": "size",
      }}
    >
      <Icon />
      <button
        type="button"
        onClick={() => props.setIsFull((prev) => !prev)}
        class="absolute top-4 right-4 p-1 rounded-full bg-zinc-800 opacity-10 hover:enabled:opacity-50 transition-opacity-100"
      >
        <div
          class="w-6 h-6 c-zinc-50"
          classList={{
            "i-material-symbols:fullscreen-rounded": !props.isFull,
            "i-material-symbols:fullscreen-exit-rounded": props.isFull,
          }}
        />
      </button>
    </div>
  );
};
export default IconWrapper;
