import { Portal } from "solid-js/web";
import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";

const Hau: PartsComponent = (props) => {
  const [iconParams] = useIconParams();

  return (
    <>
      <Portal
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eye-upper-target")!}
      >
        <path
          id="eye-pupil-fill-0"
          d="M218.202 243.148C218.03 242.7 218.204 242.191 218.611 241.938C236.71 230.661 248.943 223.368 269.359 213.599C269.855 213.361 270.455 213.567 270.695 214.062L273.753 220.381C273.995 220.88 273.782 221.482 273.282 221.721C260.707 227.739 251.33 232.78 241.623 238.484C252.682 237.211 262.95 236.682 276.163 236.554C276.72 236.549 277.175 237 277.173 237.557L277.147 244.589C277.145 245.137 276.697 245.581 276.149 245.587C255.632 245.785 242.56 246.957 221.892 250.491C221.421 250.572 220.953 250.31 220.782 249.865L218.202 243.148Z"
          fill={
            iconParams.eyes.eyelashesColor ??
            iconParams.eyes.computedEyelashesColor
          }
        />
      </Portal>
    </>
  );
};

export default Hau;
