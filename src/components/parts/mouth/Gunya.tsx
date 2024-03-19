import type { PartsComponent } from "~/components/Icon";
import { useIconColors } from "~/context/iconColors";
import { SsrPortal } from "~/context/ssrPortal";

const Gunya: PartsComponent = (props) => {
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
          d="M206.617 310.928C200.775 311.474 196.57 315.044 198.764 318.635C200.661 321.739 204.65 318.559 208.894 318.099C213.398 317.612 215.477 319.875 219.289 318.77C223.462 317.56 225.348 314.287 229.797 312.457C232.377 311.396 237.727 311.307 237.916 307.597C238.103 303.938 233.629 301.844 224.144 303.55C218.511 304.563 219.017 309.771 206.617 310.928Z"
          fill={
            iconColors.mouth.strokeColor ??
            computeColors.mouth.computedStrokeColor
          }
        />
        <path
          d="M208.5 312C203.209 312.48 201.308 315.411 202.5 317C204 319 205.157 317.904 209 317.5C213.08 317.071 216.672 318.908 220.125 317.935C223.904 316.869 225.612 313.987 229.642 312.375C231.978 311.44 236.823 311.362 236.995 308.095C237.164 304.872 233.112 303.028 224.522 304.531C219.42 305.423 219.73 310.981 208.5 312Z"
          fill={
            iconColors.mouth.insideColor ??
            computeColors.mouth.computedInsideColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default Gunya;
