import type { Component } from "solid-js";
import { Portal } from "solid-js/web";
import { useIconParams } from "~/context/icon";

const Default: Component = () => {
  const [iconParams] = useIconParams();

  return (
    <>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={document.getElementById("mouth-target")!}
      >
        <path
          d="M213.5 312C209.5 314 205 319 206.5 320C208 321 209.177 315.412 214 313C220 310 232 313.5 232 311C232 309 218.104 309.698 213.5 312Z"
          fill={
            iconParams.mouth.strokeColor ?? iconParams.mouth.computedStrokeColor
          }
        />
      </Portal>
    </>
  );
};

export default Default;
