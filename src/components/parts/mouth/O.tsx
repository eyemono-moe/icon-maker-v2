import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";

const O: PartsComponent = (props) => {
  const [iconParams, { computeColors }] = useIconParams();

  return (
    <>
      <SsrPortal
        target="mouth-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("mouth-target")!}
      >
        <path
          d="M212.5 310C208 312.1 209.5 318.5 212 321C215.5 324.5 218.625 324.5 223 322C226.5 320 226.599 317.248 225.5 314.5C224.757 312.643 219.5 306.733 212.5 310Z"
          fill={
            iconParams.mouth.strokeColor ??
            computeColors.mouth.computedStrokeColor
          }
        />
        <path
          d="M216.5 311C213 312 211 318.5 213 321C215.209 323.761 220 323.5 223 321.5C225.144 320.071 225.5 317 224.5 315C223 312 219.541 310.131 216.5 311Z"
          fill={
            iconParams.mouth.insideColor ??
            computeColors.mouth.computedInsideColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default O;
