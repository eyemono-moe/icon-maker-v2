import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";

const Default: PartsComponent = (props) => {
  const [iconParams] = useIconParams();

  return (
    <>
      <SsrPortal
        target="eyebrow-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eyebrow-target")!}
      >
        <path
          id="eyebrow-fill"
          d="M218 167.5C204 175.1 201 183.5 196 191.5C204.5 187 219.5 182 223.5 179.5C226.156 177.84 246 164 277 157C260.5 157 235.5 158 218 167.5Z"
          fill={
            iconParams.eyebrows.baseColor ??
            iconParams.eyebrows.computedBaseColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default Default;
