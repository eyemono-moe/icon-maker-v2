import type { Component } from "solid-js";
import { Portal } from "solid-js/web";
import { useIconParams } from "~/context/icon";

const Background: Component = () => {
  const [iconParams] = useIconParams();

  return (
    <>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={document.getElementById("background-target")!}
      >
        <rect
          id="background-fill"
          x="0"
          y="0"
          width="400"
          height="400"
          fill={iconParams.background}
        />
      </Portal>
    </>
  );
};

export default Background;
