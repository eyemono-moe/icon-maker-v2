import { createUniqueId } from "solid-js";
import type { PartsComponent } from "~/components/Icon";
import { useIconColors } from "~/context/iconColors";
import { SsrPortal } from "~/context/ssrPortal";

const Default: PartsComponent = (props) => {
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
            d="M271.132 212.58C276.528 226.613 273.711 238.991 263.598 242.106C253.486 245.221 244.193 236.573 240.757 221.936C237.321 207.299 239.903 194.994 248.291 192.41C256.679 189.826 265.737 198.546 271.132 212.58Z"
            fill={
              iconColors.eyes.pupilSecondaryColor ??
              computeColors.eyes.computedPupilSecondaryColor
            }
          />
          <path
            id="eye-pupil-fill-1"
            d="M270.209 212.611C273.989 224.884 271.813 235.39 262.421 238.283C253.029 241.176 245.319 233.716 241.538 221.443C237.074 206.95 241.959 196.453 248.88 194.321C255.8 192.19 265.745 198.118 270.209 212.611Z"
            fill={iconColors.eyes.pupilBaseColor}
          />
          <path
            id="eye-pupil-fill-2"
            d="M266.092 209.947C269.984 219.099 268.245 228.118 261.977 230.049C255.71 231.98 249.197 225.501 247.266 215.746C245.313 205.884 248.795 199.579 252.263 198.511C255.731 197.443 262.157 200.695 266.092 209.947Z"
            fill={
              iconColors.eyes.pupilSecondaryColor ??
              computeColors.eyes.computedPupilSecondaryColor
            }
          />
          <path
            id="eye-pupil-fill-3"
            d="M265.369 210.693C268.08 217.706 267.065 224.296 260.8 226.226C254.535 228.156 249.987 223.278 248.282 215.956C246.577 208.633 248.329 201.816 252.852 200.422C257.375 199.029 262.659 203.68 265.369 210.693Z"
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

export default Default;
