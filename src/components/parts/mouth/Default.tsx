import type { PartsComponent } from "~/components/Icon";
import { useIconColors } from "~/context/iconColors";
import { SsrPortal } from "~/context/ssrPortal";

const Default: PartsComponent = (props) => {
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
          d="M213.5 312C209.5 314 205 319 206.5 320C208 321 209.177 315.412 214 313C220 310 232 313.5 232 311C232 309 218.104 309.698 213.5 312Z"
          fill={
            iconColors.mouth.strokeColor ??
            computeColors.mouth.computedStrokeColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default Default;
