import type { PartsComponent } from "~/components/Icon";
import { useIconColors } from "~/context/iconColors";
import { SsrPortal } from "~/context/ssrPortal";

const Atsui: PartsComponent = (props) => {
  const [iconColors, { computeColors }] = useIconColors();

  return (
    <>
      <SsrPortal
        target="mouth-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("mouth-target")!}
      >
        <path
          d="M210.019 302.275C203.629 303.584 189.697 304.007 201.748 320.763C211.167 333.859 213.769 327.578 222.05 326.926C231.824 326.155 247.824 324.88 237.84 306.126C228.817 289.179 217.538 300.734 210.019 302.275Z"
          fill={
            iconColors.mouth.strokeColor ??
            computeColors.mouth.computedStrokeColor
          }
        />
        <path
          d="M210.054 303.257C200.186 305.51 197.429 313.774 202.463 320.534C210.813 331.748 213.84 327.18 222.2 326.544C232.068 325.793 247.395 323.801 238.141 307.013C230.274 292.74 217.597 301.534 210.054 303.257Z"
          fill={
            iconColors.mouth.insideColor ??
            computeColors.mouth.computedInsideColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default Atsui;
