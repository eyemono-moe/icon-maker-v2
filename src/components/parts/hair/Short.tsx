import { createUniqueId } from "solid-js";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";
import { headFillDefId } from "../head";

const hairFrontStrokeDefId = createUniqueId();
const hairFrontFillDefId = createUniqueId();
const highlightMaskId = createUniqueId();
const hairShadowMaskId = createUniqueId();

const Short: PartsComponent = (props) => {
  const [iconParams] = useIconParams();

  return (
    <>
      <defs>
        <path
          id={hairFrontStrokeDefId}
          d="M215.383 143.435C217.057 155.92 218 169.483 218 184.5C218 199 217 237.5 212.5 264.5C245 213 246 159.5 246 139.5C246 134.015 245.547 128.57 244.697 123.214C267.086 170.568 274.5 218.579 274.5 247.5C274.5 264 274.5 297 262.399 337C312.767 281.084 320.598 234.939 321.79 206.707C320.741 235.02 315.923 251.31 311.328 266.848C307.372 280.224 303.581 293.044 302.5 312.5C308.333 297.843 314.658 285.199 320.659 273.203L320.66 273.202L320.66 273.202C334.72 245.095 347 220.547 347 182C347 93 287 20 205 20C106 20 35 94 35 192C35 285.612 102 347 175 375C168.539 304.816 184.242 266.247 198.146 232.099C198.431 231.397 198.716 230.698 199 230C208.505 206.63 218.068 179.831 215.383 143.435Z"
        />
        <path
          id={hairFrontFillDefId}
          d="M324 195C324 161.639 314.684 126.796 294.979 98.4117C313.452 127.143 322 162.293 322 195C322 221 318.5 271.5 262.399 337C275.5 298 276.5 264 276.5 247.5C276.5 217.248 267.779 165.702 242.33 116.24C244.053 123.981 245 131.955 245 140C245 160 243 213 212.5 264.5C218 237.5 219 199 219 184.5C219 143.308 211.518 113.051 201.426 86.005C223.501 150.88 213.077 192.929 198 230C196.864 232.794 195.69 235.618 194.498 238.486C180.891 271.218 164.886 309.72 175 375C102 345 41 285.612 41 192C41 94 106 24 205 24C287 24 344 93 344 182C344 219.965 332.088 245.542 319.282 273.038C313.536 285.375 307.61 298.098 302.5 312.5C304.18 293.393 308.24 280.723 312.386 267.787C318.112 249.919 324 231.544 324 195Z"
        />
      </defs>
      <SsrPortal
        target="hair-back-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("hair-back-target")!}
      >
        <path
          id="hair-back-fill"
          d="M233 360C236 356 237 352 238 345C241 352 247 357 252 360C252 354 253 347 256 339C257 344 260 348 262 350C262 342 264 336 266 332C267 336 268 339 270 342C271 335 274 330 278 324C278 327 278 331 279 333C280 328 284 315 288 310C287 314 285 322 285 330C287 319 342 237 342 197C342 137 302 37 202 37C82 37 42 137 42 193C42 324 162 330 197 359C197 352 196 347 194 343C204 348 208.202 351 217.222 358C216.22 352.5 215.503 349.5 214 346C221 349 230 353 233 360Z"
          fill={
            iconParams.hair.strokeColor ?? iconParams.hair.computedStrokeColor
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
        <use
          href={`#${hairFrontFillDefId}`}
          id="hair-front-fill"
          fill={iconParams.hair.baseColor}
        />
        <mask id={highlightMaskId} mask-type="alpha">
          <use href={`#${hairFrontFillDefId}`} fill="white" />
        </mask>
        <path
          mask={`url(#${highlightMaskId})`}
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

export default Short;
