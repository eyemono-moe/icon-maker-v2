import type { Component } from "solid-js";
import { useIconColors } from "~/context/iconColors";
import { SsrPortal } from "~/context/ssrPortal";

const Background: Component = () => {
  const [iconColors] = useIconColors();

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
          fill={iconColors.background}
        />
      </SsrPortal>
    </>
  );
};

export default Background;
