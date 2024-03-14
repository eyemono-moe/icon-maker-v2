import { Portal } from "solid-js/web";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";

const Smile: PartsComponent = (props) => {
  const [iconParams] = useIconParams();

  return (
    <>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("mouth-target")!}
      >
        <path
          d="M216.5 315C209.5 316.909 205 314 204.5 316C204.063 317.749 211.79 317.389 217 316C224.5 314 231.5 308 230 307C228.336 305.891 223.5 313.091 216.5 315Z"
          fill={
            iconParams.mouth.strokeColor ?? iconParams.mouth.computedStrokeColor
          }
        />
      </Portal>
    </>
  );
};

export default Smile;
