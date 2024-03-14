import { Portal } from "solid-js/web";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";

const A: PartsComponent = (props) => {
  const [iconParams] = useIconParams();

  return (
    <>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("mouth-target")!}
      >
        <path
          d="M213.5 311C210.814 312.5 211.122 317.143 213.243 319.349C216.211 322.438 219.354 321.442 221.5 320C223.646 318.558 224.281 316.231 223.243 313.849C222 311 217 309.045 213.5 311Z"
          fill={
            iconParams.mouth.strokeColor ?? iconParams.mouth.computedStrokeColor
          }
        />
        <path
          d="M215.5 312C213.5 313 212.5 316 214 319C215.209 321.419 219 321.344 221 320C223 318.656 223.941 316.162 222.5 314C221.5 312.5 218.061 310.719 215.5 312Z"
          fill={
            iconParams.mouth.insideColor ?? iconParams.mouth.computedInsideColor
          }
        />
      </Portal>
    </>
  );
};

export default A;
