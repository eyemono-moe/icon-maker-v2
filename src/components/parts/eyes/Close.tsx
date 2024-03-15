import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";

const Close: PartsComponent = (props) => {
  const [iconParams] = useIconParams();

  return (
    <>
      <SsrPortal
        target="eye-upper-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eye-upper-target")!}
      >
        <path
          id="eyelash-fill"
          d="M212 249.5C223.5 248.5 241.071 249.5 256.5 243.5C270.5 238.056 279.5 227.5 288 213C285.5 223 282.5 233.262 275 242.222C271.985 245.843 267.27 249.439 259.5 252.5C242 259.394 227 255 212 249.5Z"
          fill={
            iconParams.eyes.eyelashesColor ??
            iconParams.eyes.computedEyelashesColor
          }
        />
        <path
          id="eyelid-fill"
          d="M211 225C217.5 218 225 212 234 207C224 210 215 216 211 225Z"
          fill={
            iconParams.eyes.eyelashesColor ??
            iconParams.eyes.computedEyelashesColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default Close;
