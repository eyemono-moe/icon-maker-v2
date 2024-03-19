import { createUniqueId } from "solid-js";
import type { PartsComponent } from "~/components/Icon";
import { useIconColors } from "~/context/iconColors";
import { SsrPortal } from "~/context/ssrPortal";

const Small: PartsComponent = (props) => {
  const [iconColors, { computeColors }] = useIconColors();
  const whiteFillId = createUniqueId();
  const maskId = createUniqueId();

  return (
    <>
      <defs>
        <path
          id={whiteFillId}
          d="M280 232C279 242.5 275.313 250.59 264 256C241 267 216 245.5 216 228C216 223.5 227.148 213.055 247.5 206C285 193 281.612 215.077 280 232Z"
        />
      </defs>
      <SsrPortal
        target="eye-lower-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eye-lower-target")!}
      >
        <use
          id="eye-white-fill"
          href={`#${whiteFillId}`}
          fill={
            iconColors.eyes.eyeWhiteColor ??
            computeColors.eyes.computedEyeWhiteColor
          }
        />
        <mask id={maskId} mask-type="alpha">
          <use href={`#${whiteFillId}`} fill="white" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <path
            id="eye-pupil-fill-0"
            d="M264.066 218.44C266.764 225.457 265.356 231.645 260.299 233.203C255.243 234.76 250.596 230.437 248.879 223.118C247.161 215.799 248.452 209.647 252.646 208.355C256.839 207.063 261.368 211.423 264.066 218.44Z"
            fill={
              iconColors.eyes.pupilSecondaryColor ??
              computeColors.eyes.computedPupilSecondaryColor
            }
          />
          <path
            id="eye-pupil-fill-1"
            d="M263.604 218.456C265.495 224.592 264.407 229.845 259.71 231.292C255.014 232.738 251.159 229.008 249.269 222.871C247.037 215.625 249.48 210.377 252.94 209.311C256.4 208.245 261.372 211.209 263.604 218.456Z"
            fill={iconColors.eyes.pupilBaseColor}
          />
          <path
            id="eye-pupil-fill-2"
            d="M261.546 217.124C263.492 221.699 262.623 226.209 259.489 227.174C256.355 228.14 253.099 224.901 252.133 220.023C251.156 215.092 252.898 211.94 254.632 211.406C256.365 210.871 259.579 212.498 261.546 217.124Z"
            fill={
              iconColors.eyes.pupilSecondaryColor ??
              computeColors.eyes.computedPupilSecondaryColor
            }
          />
          <path
            id="eye-pupil-fill-3"
            d="M261.185 217.496C262.54 221.003 262.033 224.298 258.9 225.263C255.767 226.228 253.494 223.789 252.641 220.128C251.788 216.467 252.664 213.058 254.926 212.361C257.187 211.665 259.83 213.99 261.185 217.496Z"
            fill={iconColors.eyes.pupilBaseColor}
          />
          <g style="mix-blend-mode:multiply">
            <path
              id="eye-shadow-fill"
              d="M288 193.5C247.5 193.5 233 197 207 223.5C207 232.5 217 246 224 250C237 224 274 212 288 212C288 199.5 288 199.424 288 193.5Z"
              fill={
                iconColors.eyes.shadowColor ??
                computeColors.eyes.computedShadowColor
              }
            />
          </g>
          <path
            id="eye-lower-eyelid-fill"
            d="M277 245C271.5 253 255 262 239 257C239 265 277 263.5 277 245Z"
            fill={
              iconColors.eyes.eyelashesColor ??
              computeColors.eyes.computedEyelashesColor
            }
          />
        </g>
      </SsrPortal>
      <SsrPortal
        target="eye-upper-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eye-upper-target")!}
      >
        <path
          id="eyelash-fill"
          d="M207 236C212 222 228.5 210.315 244.5 203.5C260.935 196.5 277 197.5 286.5 200C284 206 286 214 280 232C280.5 225 279 210 276 207.5C272.741 204.784 252.899 210.218 248 212C237 216 218 225.5 207 236Z"
          fill={
            iconColors.eyes.eyelashesColor ??
            computeColors.eyes.computedEyelashesColor
          }
        />
        <path
          id="eyelid-fill"
          d="M211 225C217.5 218 225 212 234 207C224 210 215 216 211 225Z"
          fill={
            iconColors.eyes.eyelashesColor ??
            computeColors.eyes.computedEyelashesColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default Small;
