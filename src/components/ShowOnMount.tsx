import { createPresence } from "@solid-primitives/presence";
import { type ParentComponent, Show, createSignal, onMount } from "solid-js";

const ShowOnMount: ParentComponent = (props) => {
  const [showStuff, setShowStuff] = createSignal(false);
  const { isVisible, isMounted } = createPresence(showStuff, {
    transitionDuration: 400,
  });

  onMount(() => {
    setShowStuff(true);
  });

  return (
    <Show when={isMounted()}>
      <div
        class="transition-opacity transition-duration-400"
        classList={{
          "op-100": isVisible(),
          "op-0": !isVisible(),
        }}
      >
        {props.children}
      </div>
    </Show>
  );
};

export default ShowOnMount;
