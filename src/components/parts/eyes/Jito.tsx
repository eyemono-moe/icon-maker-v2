import { createUniqueId } from "solid-js";
import { Portal } from "solid-js/web";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";

const Jito: PartsComponent = (props) => {
  const [iconParams] = useIconParams();
  const whiteFillId = createUniqueId();
  const maskId = createUniqueId();

  return (
    <>
      <defs>
        <path
          id={whiteFillId}
          d="M279 229.5C277.5 236.5 270.5 245.217 260.5 250C242.5 258.609 217.594 248.5 216.5 231C216.344 228.5 228.148 222.055 248.5 215C286 202 282.562 212.877 279 229.5Z"
        />
      </defs>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eye-lower-target")!}
      >
        <use
          id="eye-white-fill"
          href={`#${whiteFillId}`}
          fill={
            iconParams.eyes.eyeWhiteColor ??
            iconParams.eyes.computedEyeWhiteColor
          }
        />
        <mask id={maskId} mask-type="alpha">
          <use href={`#${whiteFillId}`} fill="white" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <path
            id="eye-pupil-fill-0"
            d="M271.132 212.58C276.528 226.613 273.711 238.991 263.598 242.106C253.486 245.221 244.193 236.573 240.757 221.936C237.321 207.299 239.903 194.994 248.291 192.41C256.679 189.826 265.737 198.546 271.132 212.58Z"
            fill={
              iconParams.eyes.pupilSecondaryColor ??
              iconParams.eyes.computedPupilSecondaryColor
            }
          />
          <path
            id="eye-pupil-fill-1"
            d="M270.209 212.611C273.989 224.884 271.813 235.39 262.421 238.283C253.029 241.176 245.319 233.716 241.538 221.443C237.074 206.95 241.959 196.453 248.88 194.321C255.8 192.19 265.745 198.118 270.209 212.611Z"
            fill={iconParams.eyes.pupilBaseColor}
          />
          <path
            id="eye-pupil-fill-2"
            d="M266.092 209.947C269.984 219.099 268.245 228.118 261.977 230.049C255.71 231.98 249.197 225.501 247.266 215.746C245.313 205.884 248.795 199.579 252.263 198.511C255.731 197.443 262.157 200.695 266.092 209.947Z"
            fill={
              iconParams.eyes.pupilSecondaryColor ??
              iconParams.eyes.computedPupilSecondaryColor
            }
          />
          <path
            id="eye-pupil-fill-3"
            d="M265.369 210.693C268.08 217.706 267.065 224.296 260.8 226.226C254.535 228.156 249.987 223.278 248.282 215.956C246.577 208.633 248.329 201.816 252.852 200.422C257.375 199.029 262.659 203.68 265.369 210.693Z"
            fill={iconParams.eyes.pupilBaseColor}
          />
          <g style="mix-blend-mode:multiply">
            <path
              id="eye-shadow-fill"
              d="M288 193.5C247.5 193.5 233 197 207 223.5C207 232.5 217 246 224 250C237 224 274 212 288 212C288 199.5 288 199.424 288 193.5Z"
              fill={
                iconParams.eyes.shadowColor ??
                iconParams.eyes.computedShadowColor
              }
            />
          </g>
          <path
            id="eye-lower-eyelid-fill"
            d="M274.5 239C269.5 246 250.5 254 236.5 252C236.5 260 274.5 257.5 274.5 239Z"
            fill={
              iconParams.eyes.eyelashesColor ??
              iconParams.eyes.computedEyelashesColor
            }
          />
        </g>
      </Portal>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eye-upper-target")!}
      >
        <path
          id="eyelash-fill"
          d="M208.5 238.5C215.5 226.5 231 217 247 211.5C263.893 205.693 277.5 203 287 205.5C284.5 211.5 285 211.5 279 229.5C279.5 222.5 279.5 212.75 278 211.5C277 210.667 254.399 218.218 249.5 220C238.5 224 219.5 232 208.5 238.5Z"
          fill={
            iconParams.eyes.eyelashesColor ??
            iconParams.eyes.computedEyelashesColor
          }
        />
        <path
          id="eyelid-fill"
          d="M211.5 226.5C218 221 227 215 236 210C226 213 216.5 218.5 211.5 226.5Z"
          fill={
            iconParams.eyes.eyelashesColor ??
            iconParams.eyes.computedEyelashesColor
          }
        />
      </Portal>
    </>
  );
};

export default Jito;
