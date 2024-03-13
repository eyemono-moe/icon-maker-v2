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
        mount={document.getElementById("eyebrow-target")!}
      >
        <path
          id="eyebrow-fill"
          d="M218 167.5C204 175.1 201 183.5 196 191.5C204.5 187 219.5 182 223.5 179.5C226.156 177.84 246 164 277 157C260.5 157 235.5 158 218 167.5Z"
          fill={
            iconParams.eyebrows.baseColor ??
            iconParams.eyebrows.computedBaseColor
          }
        />
      </Portal>
    </>
  );
};

export default Default;
