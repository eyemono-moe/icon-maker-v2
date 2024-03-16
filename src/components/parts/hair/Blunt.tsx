import { createUniqueId } from "solid-js";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";
import { headFillDefId } from "../head";

const Blunt: PartsComponent = (props) => {
  const [iconParams] = useIconParams();
  const hairFrontStrokeDefId = createUniqueId();

  return (
    <>
      <defs>
        <path
          id={hairFrontStrokeDefId}
          d="M181.04 38.034C181.026 38.0227 181.013 38.0113 181 38C180.971 38.0123 180.942 38.0247 180.913 38.037C180.955 38.036 180.997 38.035 181.04 38.034ZM217.857 218.988C217.223 235.139 215.71 253.091 214 268.768C220.5 265.768 234.5 258 239 255C247.5 226.5 253.755 191.268 248.5 139.768C248.08 135.651 247.476 131.572 246.704 127.549C267.531 173.479 274.5 219.462 274.5 247.5C274.5 264 274.5 297 262.399 337C297.704 297.806 312.11 263.413 317.979 236.624C312.616 264.229 302.763 287.449 293.867 308.411L293.859 308.43L293.827 308.505C293.043 310.354 292.266 312.185 291.5 314C294 313.5 298 312.5 300 312C301.219 309.947 302.475 307.85 303.757 305.706L303.763 305.696C322.482 274.426 347 233.467 347 182C347 93 287 20 205 20C106 20 35 94 35 192C35 285.612 102 347 175 375C151.587 348.755 134.876 326.003 122.821 305.21C153.24 299.411 186.909 288 206 277.5C210.621 263.103 215.622 243.524 217.857 218.988Z"
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
          d="M169.5 360C147.5 351 42 284 42 193C42 137 82 37 202 37C302 37 342 137 342 197C342 226.5 295 314.5 281.5 334C279.281 335.11 276.966 336.19 274.569 337.241C276.031 321.069 277 307.231 277 290C276.652 307.276 275.042 322.116 273.077 337.886C269.318 339.492 265.371 341.025 261.291 342.48C256.937 321.264 254.906 313.758 249 298.5C253.874 313.61 256.671 326.252 259.297 343.181C252.002 345.712 244.316 347.996 236.54 350.006C233.394 343.171 231.716 338.908 230.081 334.754C228.564 330.899 227.084 327.137 224.5 321.5C227.916 332.724 231.809 342.996 234.783 350.456C227.623 352.266 220.407 353.843 213.369 355.165C202.768 341.094 196.855 330.74 189.5 317.5C195.794 330.572 201.619 342.237 210.606 355.673C202.663 357.101 194.989 358.196 187.928 358.927C179.141 350.117 170.862 341.256 163 330C169.809 340.7 177.091 349.508 185.307 359.184C179.507 359.722 174.17 360 169.5 360Z"
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
          d="M294.979 98.4121C314.684 126.797 324 161.639 324 195C324 241 308.5 278 292 313.5C294.5 313 298 312 299.5 311.5C302.071 306.566 304.787 301.564 307.558 296.462C324.725 264.85 344 229.356 344 182C344 93 287 24 205 24C106 24 41 94 41 192C41 285.612 102 345 175 375C125.328 340.681 91.9689 279.446 82.657 222.602C90.8029 253.797 107.789 288.857 118.5 304C150 298.5 185 287.5 205 276.5C212.489 253.169 219.812 210.922 215.785 160.082C216.99 168.726 218.063 177.837 219 187.5C220.892 207 220 241 214.5 268C221 265 234 257.5 238.5 254.5C245.503 226.493 251.255 191.5 246 140C245.071 130.893 243.313 121.977 240.867 113.433C267.446 163.743 276.5 216.676 276.5 247.5C276.5 264 275.5 298 262.399 337C318.5 271.5 322 221 322 195C322 162.293 313.452 127.144 294.979 98.4121ZM180.703 38.1361C180.802 38.0906 180.901 38.0453 181 38L181.048 38.1094C180.933 38.1178 180.818 38.1267 180.703 38.1361Z"
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

export default Blunt;
