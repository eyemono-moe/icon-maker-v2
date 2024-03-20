import type { PartsComponent } from "~/components/Icon";
import { useIconColors } from "~/context/iconColors";
import { SsrPortal } from "~/context/ssrPortal";

const Komari: PartsComponent = (props) => {
  const [iconColors, { computeColors }] = useIconColors();

  return (
    <>
      <SsrPortal
        target="eyebrow-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eyebrow-target")!}
      >
        <path
          id="eyebrow-fill"
          d="M221.5 171C213.045 173.182 201 181.5 193 184C201 186.5 220.621 185.098 224.5 184C227.387 183.183 252 178 279 165C263 169 237 167 221.5 171Z"
          fill={
            iconColors.eyebrows.baseColor ??
            computeColors.eyebrows.computedBaseColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default Komari;
