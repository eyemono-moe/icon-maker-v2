import { createUniqueId } from "solid-js";
import type { PartsComponent } from "~/components/Icon";
import { useIconColors } from "~/context/iconColors";
import { SsrPortal } from "~/context/ssrPortal";
import { headFillDefId } from "../head";

const BluntPonyTail: PartsComponent = (props) => {
  const [iconColors, { computeColors }] = useIconColors();
  const hairFrontStrokeDefId = createUniqueId();
  const hairFrontFillDefId = createUniqueId();
  const highlightMaskId = createUniqueId();
  const hairShadowMaskId = createUniqueId();
  const hairTailFillDefId = createUniqueId();
  const hairTailShadowMaskId = createUniqueId();

  return (
    <>
      <defs>
        <path
          id={hairTailFillDefId}
          d="M336.795 182.816C361.019 290.686 363.413 313.712 342 366C378.5 319.5 386.226 259 360.726 161C342 79 307.5 31.1885 268.688 31.1885C231.713 31.1885 246.868 119.461 256.429 175.778C258.682 189.048 260.624 200.489 261.5 208.5C267.285 261.39 282.833 290.097 296.302 314.964C304.224 329.591 311.426 342.89 315.5 359C313.172 336.751 306.772 320.928 300.059 304.326C293.797 288.842 287.261 272.682 283.5 250C283.473 249.842 283.447 249.683 283.421 249.524C283.447 249.683 283.474 249.842 283.5 250C287.055 271.439 294.025 287.363 300.555 302.283C304.266 310.761 307.834 318.915 310.553 327.571C316.564 339.155 322.008 350.549 326.707 366.001C337 350.569 346.376 335.576 354.07 319.972C357.765 289.802 352.819 254.27 336.795 182.816Z"
        />
        <path
          id={hairFrontStrokeDefId}
          d="M181.04 38.034C181.026 38.0227 181.013 38.0113 181 38C180.971 38.0123 180.942 38.0247 180.913 38.037C180.955 38.036 180.997 38.035 181.04 38.034ZM217.857 218.988C217.223 235.139 215.71 253.091 214 268.768C220.5 265.768 234.5 258 239 255C247.5 226.5 253.755 191.268 248.5 139.768C248.08 135.651 247.476 131.572 246.704 127.549C267.531 173.479 274.5 219.462 274.5 247.5C274.5 264 274.5 297 262.399 337C276.979 320.815 287.994 305.448 296.316 291.097C311.339 274.445 347 232.56 347 182C347 93 287 20 205 20C106 20 35 94 35 192C35 285.612 102 347 175 375C151.587 348.755 134.876 326.003 122.821 305.21C153.24 299.411 186.909 288 206 277.5C210.621 263.103 215.622 243.524 217.857 218.988Z"
        />
        <path
          id={hairFrontFillDefId}
          d="M181 38C180.901 38.0453 180.802 38.0907 180.703 38.1361C180.818 38.1267 180.933 38.1178 181.048 38.1094L181 38ZM82.6569 222.602C91.9688 279.446 125.328 340.681 175 375C102 345 41 285.612 41 192C41 94.0244 105.968 24.0348 204.926 24C204.951 24 204.975 24 205 24C287 24 344 93 344 182C344 234.751 312.032 271.756 298.901 286.957C298.76 287.12 298.621 287.28 298.485 287.438C298.32 287.629 298.158 287.816 298 288C298.655 286.543 299.672 284.62 300.929 282.239C308.307 268.275 324 238.571 324 195C324 161.639 314.684 126.797 294.979 98.412C313.452 127.144 322 162.293 322 195C322 221 318.5 271.5 262.399 337C275.5 298 276.5 264 276.5 247.5C276.5 216.676 267.446 163.743 240.867 113.433C243.313 121.977 245.071 130.893 246 140C251.255 191.5 245.503 226.493 238.5 254.5C234 257.5 221 265 214.5 268C220 241 220.892 207 219 187.5C218.063 177.837 216.99 168.726 215.785 160.082C219.812 210.922 212.489 253.169 205 276.5C185 287.5 150 298.5 118.5 304C107.789 288.857 90.8028 253.797 82.6569 222.602Z"
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
            iconColors.hair.strokeColor ??
            computeColors.hair.computedStrokeColor
          }
        />
        <use
          id="hair-back-fill"
          href={`#${hairTailFillDefId}`}
          fill={iconColors.hair.baseColor}
        />
        <mask id={hairTailShadowMaskId} mask-type="alpha">
          <use href={`#${hairTailFillDefId}`} fill="white" />
        </mask>
        <g mask={`url(#${hairTailShadowMaskId})`}>
          <path
            d="M244.869 100.233C281.044 91.1781 325.868 156.27 334.46 172.895C333.281 168.152 331.945 163.123 330.454 157.881C344.221 181.991 353.894 205.153 359.966 227.331C358.731 215.863 356.765 204.042 354 191.5C366.152 218.919 375.875 268.332 371 310.5C368.499 325.163 360.223 388.542 324 386C295.5 384 296.5 348.5 267 291C237.5 233.5 210 108.962 244.869 100.233Z"
            fill={
              iconColors.hair.strokeColor ??
              computeColors.hair.computedStrokeColor
            }
            fill-opacity="0.5"
          />
        </g>
        <path
          id="hair-back-stroke-2"
          d="M42 193C42 324 205.5 349.5 238.5 338C271.5 326.5 342 237 342 197C342 137 302 37 202 37C82 37 42 137 42 193Z"
          fill={
            iconColors.hair.strokeColor ??
            computeColors.hair.computedStrokeColor
          }
        />
      </SsrPortal>
      <SsrPortal
        target="hair-shadow-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("hair-shadow-target")!}
      >
        <mask id={hairShadowMaskId} mask-type="alpha">
          <use href={`#${headFillDefId}`} fill="white" />
        </mask>
        <g mask={`url(#${hairShadowMaskId})`}>
          <use
            id="hair-shadow-fill"
            href={`#${hairFrontStrokeDefId}`}
            transform="translate(3 12)"
            fill={
              iconColors.head.shadowColor ??
              computeColors.head.computedShadowColor
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
            iconColors.hair.strokeColor ??
            computeColors.hair.computedStrokeColor
          }
        />
        <use
          href={`#${hairFrontFillDefId}`}
          id="hair-front-fill"
          fill={iconColors.hair.baseColor}
        />
        <mask id={highlightMaskId} mask-type="alpha">
          <use href={`#${hairFrontFillDefId}`} fill="white" />
        </mask>
        <path
          mask={`url(#${highlightMaskId})`}
          id="hair-front-highlight"
          d="M122 182C220.209 182 304.64 147.59 341.796 98.3108V18H29.5V384H212C121.978 384 48.9999 304.307 48.9999 206C48.9999 195.717 49.7984 185.638 51.3313 175.832C73.6726 179.842 97.4042 182 122 182ZM335.164 89.4015C309.993 120.089 243.754 142 166 142C128.695 142 94.0398 136.956 65.2997 128.319C91.7174 68.9349 147.481 28 212 28C261.183 28 305.278 51.7874 335.164 89.4015Z"
          fill={
            iconColors.hair.highlightColor ??
            computeColors.hair.computedHighlightColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default BluntPonyTail;
