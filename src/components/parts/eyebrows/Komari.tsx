import { Portal } from "solid-js/web";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";

const Komari: PartsComponent = (props) => {
  const [iconParams] = useIconParams();

  return (
    <>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eyebrow-target")!}
      >
        <path
          id="eyebrow-fill"
          d="M221.5 171C213.045 173.182 201 181.5 193 184C201 186.5 220.621 185.098 224.5 184C227.387 183.183 252 178 279 165C263 169 237 167 221.5 171Z"
          fill={
            iconParams.eyebrows.baseColor ??
            iconParams.eyebrows.computedBaseColor
          }
        />
      </Portal>
    </>
  );
};

export default Komari;
