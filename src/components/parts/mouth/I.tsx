import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";

const I: PartsComponent = (props) => {
  const [iconParams] = useIconParams();

  return (
    <>
      <SsrPortal
        target="mouth-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("mouth-target")!}
      >
        <path
          d="M214 313C208.296 315.074 202.345 315.818 203 318C204.5 323 213.903 320.251 217.5 319C229 315 236 310.5 234 307C232.425 304.244 225 309 214 313Z"
          fill={
            iconParams.mouth.strokeColor ?? iconParams.mouth.computedStrokeColor
          }
        />
        <path
          d="M214 313.5C208.271 315.505 203.447 315.79 204 318C205 322 214.427 319.816 218 318.5C227.5 315 233.5 311.5 231.5 308C230.223 305.764 224 310 214 313.5Z"
          fill={
            iconParams.mouth.teethColor ?? iconParams.mouth.computedTeethColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default I;
