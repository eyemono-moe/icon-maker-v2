import { createUniqueId } from "solid-js";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";
import { headFillDefId } from "../head";

const PonyTail: PartsComponent = (props) => {
  const [iconParams] = useIconParams();
  const hairFrontStrokeDefId = createUniqueId();

  return (
    <>
      <defs>
        <path
          id={hairFrontStrokeDefId}
          d="M215.383 143.435C217.057 155.92 218 169.483 218 184.5C218 199 217 237.5 212.5 264.5C245 213 246 159.5 246 139.5C246 134.015 245.547 128.57 244.697 123.214C267.086 170.568 274.5 218.579 274.5 247.5C274.5 264 274.5 297 262.399 337C276.979 320.815 287.994 305.448 296.316 291.097C311.339 274.445 347 232.56 347 182C347 93 287 20 205 20C106 20 35 94 35 192C35 285.612 102 347 175 375C168.539 304.816 184.242 266.247 198.146 232.099C198.431 231.397 198.716 230.698 199 230C208.505 206.63 218.068 179.831 215.383 143.435Z"
        />
      </defs>
      <SsrPortal
        target="hair-back-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("hair-back-target")!}
      >
        <path
          id="hair-back-stroke-1"
          d="M259.5 208.5C265.545 263.766 281.384 291.978 295.784 317.628C303.271 330.964 310.369 343.607 315.5 359C315.5 352.238 314.857 346.033 313.748 340.181C317.647 346.309 321.736 353.621 326.707 366.001C336.507 354.891 345.25 342.926 352.533 329.811C350.307 341.542 346.743 352.955 342 366C382.955 319.572 390.203 258.192 364.845 160.457C364.805 160.305 364.766 160.153 364.726 160C345.935 87.7826 316.651 31.3768 268.688 29.1884L268.688 29.1884C229.592 27.4057 245.075 119.759 254.625 176.719C256.79 189.637 258.651 200.734 259.5 208.5Z"
          fill={
            iconParams.hair.strokeColor ?? iconParams.hair.computedStrokeColor
          }
        />
        <path
          id="hair-back-fill"
          d="M336.795 182.816C361.019 290.686 363.413 313.712 342 366C378.5 319.5 386.226 259 360.726 161C342 79 307.5 31.1885 268.688 31.1885C231.713 31.1885 246.868 119.461 256.429 175.778C258.682 189.048 260.624 200.489 261.5 208.5C267.285 261.39 282.833 290.097 296.302 314.964C304.224 329.591 311.426 342.89 315.5 359C313.172 336.751 306.772 320.928 300.059 304.326C293.797 288.842 287.261 272.682 283.5 250C283.473 249.842 283.447 249.683 283.421 249.524C283.447 249.683 283.474 249.842 283.5 250C287.055 271.439 294.025 287.363 300.555 302.283C304.266 310.761 307.834 318.915 310.553 327.571C316.564 339.155 322.008 350.549 326.707 366.001C337 350.569 346.376 335.576 354.07 319.972C357.765 289.802 352.819 254.27 336.795 182.816Z"
          fill={iconParams.hair.baseColor}
        />
        <path
          id="hair-back-stroke-2"
          d="M42 193C42 324 205.5 349.5 238.5 338C271.5 326.5 342 237 342 197C342 137 302 37 202 37C82 37 42 137 42 193Z"
          fill={
            iconParams.hair.strokeColor ?? iconParams.hair.computedStrokeColor
          }
        />
      </SsrPortal>
      <SsrPortal
        target="hair-shadow-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={document.getElementById("hair-shadow-target")!}
      >
        <mask id="mask-hair-shadow" mask-type="alpha">
          <use href={`#${headFillDefId}`} fill="white" />
        </mask>
        <g mask="url(#mask-hair-shadow)">
          <use
            id="hair-shadow-fill"
            href={`#${hairFrontStrokeDefId}`}
            transform="translate(3 12)"
            fill={
              iconParams.head.shadowColor ?? iconParams.head.computedShadowColor
            }
          />
        </g>
      </SsrPortal>
      <SsrPortal
        target="hair-front-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("hair-front-target")!}
      >
        <use
          id="hair-front-stroke"
          href={`#${hairFrontStrokeDefId}`}
          fill={
            iconParams.hair.strokeColor ?? iconParams.hair.computedStrokeColor
          }
        />
        <path
          id="hair-front-fill"
          d="M324 195C324 161.639 314.684 126.796 294.979 98.4117C313.452 127.143 322 162.293 322 195C322 221 318.5 271.5 262.399 337C275.5 298 276.5 264 276.5 247.5C276.5 217.248 267.779 165.702 242.33 116.24C244.053 123.981 245 131.955 245 140C245 160 243 213 212.5 264.5C218 237.5 219 199 219 184.5C219 143.308 211.518 113.051 201.426 86.005C223.501 150.88 213.077 192.929 198 230C196.864 232.794 195.69 235.618 194.498 238.486C180.891 271.218 164.886 309.72 175 375C102 345 41 285.612 41 192C41 94 106 24 205 24C287 24 344 93 344 182C344 234.751 312.032 271.756 298.901 286.957C298.59 287.317 298.289 287.665 298 288C298.655 286.543 299.672 284.62 300.929 282.239C308.307 268.275 324 238.571 324 195Z"
          fill={iconParams.hair.baseColor}
        />
        <mask id="mask-hair-front-highlight" mask-type="alpha">
          <use href="#hair-front-fill" />
        </mask>
        <path
          mask="url(#mask-hair-front-highlight)"
          id="hair-front-highlight"
          d="M122 182C220.209 182 304.64 147.59 341.796 98.3108V18H29.5V384H212C121.978 384 48.9999 304.307 48.9999 206C48.9999 195.717 49.7984 185.638 51.3313 175.832C73.6726 179.842 97.4042 182 122 182ZM335.164 89.4015C309.993 120.089 243.754 142 166 142C128.695 142 94.0398 136.956 65.2997 128.319C91.7174 68.9349 147.481 28 212 28C261.183 28 305.278 51.7874 335.164 89.4015Z"
          fill={
            iconParams.hair.highlightColor ??
            iconParams.hair.computedHighlightColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default PonyTail;
