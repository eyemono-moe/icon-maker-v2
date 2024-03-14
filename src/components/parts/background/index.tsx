import { Portal } from "solid-js/web";
import { useIconParams } from "~/context/icon";

const Background: PartsComponent = () => {
  const [iconParams] = useIconParams();

  return (
    <>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={document.getElementById("background-target")!}
      >
        <rect
          id="background-fill"
          x="0"
          y="0"
          width="500"
          height="500"
          fill={iconParams.background}
        />
      </Portal>
    </>
  );
};

export default Background;
