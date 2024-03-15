import type { Component } from "solid-js";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";

const Background: Component = () => {
  const [iconParams] = useIconParams();

  return (
    <>
      <SsrPortal
        target="background-target"
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
      </SsrPortal>
    </>
  );
};

export default Background;
