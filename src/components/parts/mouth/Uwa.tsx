import { Portal } from "solid-js/web";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";

const Uwa: PartsComponent = (props) => {
  const [iconParams] = useIconParams();

  return (
    <>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("mouth-target")!}
      >
        <path
          d="M212.5 308C207 310.567 203 317.5 205.5 322C207.436 325.485 215.5 323 223 320C229 317.6 234 316 232 311C230.4 307 220 304.5 212.5 308Z"
          fill={
            iconParams.mouth.strokeColor ?? iconParams.mouth.computedStrokeColor
          }
        />
        <path
          d="M214.734 308.6C209.478 311.055 206.938 316.377 209 320.5C210.5 323.5 217.5 322 224 319.5C229.218 317.493 232.5 315.5 231 311.5C229.612 307.799 221.424 305.475 214.734 308.6Z"
          fill={
            iconParams.mouth.insideColor ?? iconParams.mouth.computedInsideColor
          }
        />
      </Portal>
    </>
  );
};

export default Uwa;
