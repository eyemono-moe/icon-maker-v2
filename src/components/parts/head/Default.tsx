import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";
import { headFillDefId } from ".";

const Default: PartsComponent = (props) => {
  const [iconParams, { computeColors }] = useIconParams();

  return (
    <>
      <defs>
        <path
          id="neck-fill-def"
          d="M298.511 371.165C287.857 377.055 268.3 380 255 380C239.063 380 221.662 377.342 211.827 373.68C220.668 367.082 225.5 360.256 225.5 354.5C225.5 344.876 222.475 339.831 218.023 334.25L218.022 334.249C217.475 333.563 216.921 332.869 216.368 332.158C216.071 331.776 215.686 330.676 216.748 327.984C217.754 325.432 219.775 322.253 222.646 318.698C228.359 311.625 236.943 303.669 245.67 297.154C254.499 290.563 263.02 285.793 268.614 284.624C271.498 284.022 272.55 284.579 272.875 284.924C273.246 285.319 273.961 286.756 273.069 290.863C272.288 294.452 271.401 297.242 270.55 299.917C268.687 305.773 268.5 311.076 268.5 323C268.5 343.401 281.713 361.443 298.511 371.165Z"
        />
        <path
          id={headFillDefId}
          d="M228 340C218.389 343.218 156.342 335.527 143.368 327.321C130.393 319.116 66 260.715 66 194.109C66 127.502 108.768 58 197.189 58C285.609 58 313 127.502 313 197.005C313 234.652 296.124 271.703 291.375 279.539C277.92 301.741 237.611 336.782 228 340Z"
        />
      </defs>
      <SsrPortal
        target="neck-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("neck-target")!}
      >
        <use
          id="neck-fill"
          href="#neck-fill-def"
          fill={iconParams.head.baseColor}
        />
        <path
          id="neck-stroke"
          d="M215.681 336.131C220.113 341.706 223.5 345.966 223.5 354.5C223.5 362.51 215.121 367.607 210.324 370.525C209.38 371.099 208.575 371.589 208 372C209.195 372.633 210.622 373.246 212.243 373.832C212.103 373.782 211.964 373.731 211.827 373.68C220.668 367.082 225.5 360.256 225.5 354.5C225.5 344.876 222.475 339.831 218.023 334.25L218.022 334.249C217.475 333.563 216.921 332.869 216.368 332.158C216.071 331.776 215.686 330.676 216.748 327.984C217.754 325.432 219.775 322.253 222.646 318.698C228.359 311.625 236.943 303.669 245.67 297.154C254.499 290.563 263.02 285.793 268.614 284.624C271.498 284.022 272.55 284.579 272.875 284.924C273.246 285.319 273.961 286.756 273.069 290.863C272.288 294.452 271.401 297.242 270.55 299.917C268.687 305.773 268.5 311.076 268.5 323C268.5 343.401 281.713 361.443 298.511 371.165C300.274 370.191 301.793 369.136 303 368C291.5 361 270 347 270 323C270 311.537 271.506 306.83 273.312 301.191C274.183 298.467 275.125 295.526 276 291.5C283.5 257 203.5 320.5 214 334C214.573 334.737 215.135 335.444 215.681 336.131Z"
          fill={
            iconParams.head.strokeColor ??
            computeColors.head.computedStrokeColor
          }
        />
        <mask id="mask-neck-shadow">
          <use href="#neck-fill-def" fill="white" />
        </mask>
        <path
          id="neck-shadow"
          mask="url(#mask-neck-shadow)"
          d="M197 288.5L196.5 261L289.5 260V288.5C289.5 288.5 254 351.5 231.5 351.5C215 351.5 197 288.5 197 288.5Z"
          fill={
            iconParams.head.shadowColor ??
            computeColors.head.computedShadowColor
          }
        />
      </SsrPortal>
      <SsrPortal
        target="nose-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("nose-target")!}
      >
        <path
          id="nose-fill"
          d="M193 291C192.5 290.5 191.521 289.26 191 289C190 288.5 189 288.5 188 288.5C188.5 290 188.5 290 189 290.5C189.5 291 192 291 193 291Z"
          fill={
            iconParams.head.strokeColor ??
            computeColors.head.computedStrokeColor
          }
        />
      </SsrPortal>
      <SsrPortal
        target="head-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("head-target")!}
      >
        <use
          id="head-fill"
          href={`#${headFillDefId}`}
          fill={iconParams.head.baseColor}
        />
        <path
          id="head-stroke"
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M141.5 332C155 340.5 218.5 345.333 228.5 342C238.5 338.667 281.5 305.5 295.5 282.5C300.441 274.382 318 236 318 197C318 125 289.5 53 197.5 53C105.5 53 61 125 61 194C61 263 128 323.5 141.5 332ZM143.368 327.321C156.342 335.527 218.389 343.218 228 340C237.611 336.782 277.92 301.741 291.375 279.539C296.124 271.703 313 234.652 313 197.005C313 127.502 285.609 58 197.189 58C108.768 58 66 127.502 66 194.109C66 260.715 130.393 319.116 143.368 327.321Z"
          fill={
            iconParams.head.strokeColor ??
            computeColors.head.computedStrokeColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default Default;
