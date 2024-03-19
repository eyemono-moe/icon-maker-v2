import type { PartsComponent } from "~/components/Icon";
import { useIconColors } from "~/context/iconColors";
import { SsrPortal } from "~/context/ssrPortal";

const E: PartsComponent = (props) => {
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
          d="M213 312C207.515 314.598 204.057 316.926 205 319C207.5 324.5 213.5 323.5 221.5 320.5C228.083 318.032 234 314 232 309C231.087 306.717 222.5 307.5 213 312Z"
          fill={
            iconColors.mouth.strokeColor ??
            computeColors.mouth.computedStrokeColor
          }
        />
        <path
          d="M215 312.5C210 315 209.5 317.66 209.5 318.5C209.5 322 213.5 323.5 221.5 320.5C228.083 318.031 233.183 313.578 230.5 310C229 308 222.642 308.679 215 312.5Z"
          fill={
            iconColors.mouth.insideColor ??
            computeColors.mouth.computedInsideColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default E;
