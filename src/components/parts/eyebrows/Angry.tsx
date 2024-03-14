import { Portal } from "solid-js/web";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";

const Angry: PartsComponent = (props) => {
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
          d="M219.5 181.5C207.832 192.345 206 198.5 200.5 206C209.5 201.5 226.248 194.417 229.5 191C231.66 188.731 250 172 268 149.5C250 162.5 234.085 167.944 219.5 181.5Z"
          fill={
            iconParams.eyebrows.baseColor ??
            iconParams.eyebrows.computedBaseColor
          }
        />
      </Portal>
    </>
  );
};

export default Angry;
