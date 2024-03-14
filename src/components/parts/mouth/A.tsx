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
          d="M212.5 310C207 312.567 204.637 316.418 205.5 318C208.5 323.5 215.5 325 223 322C229 319.6 233 314 231 309C230.257 307.143 220 306.5 212.5 310Z"
          fill={
            iconParams.mouth.strokeColor ?? iconParams.mouth.computedStrokeColor
          }
        />
        <path
          d="M214.734 310.6C209.478 313.055 208.481 316.666 209 319C210 323.5 217.5 324.5 224 321.5C229.076 319.157 231.6 313.5 229.5 310C228.414 308.191 221.424 307.475 214.734 310.6Z"
          fill={
            iconParams.mouth.insideColor ?? iconParams.mouth.computedInsideColor
          }
        />
      </Portal>
    </>
  );
};

export default A;
