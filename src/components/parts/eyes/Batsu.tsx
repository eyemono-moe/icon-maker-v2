import type { PartsComponent } from "~/components/Icon";
import { useIconParams } from "~/context/icon";
import { SsrPortal } from "~/context/ssrPortal";

const Batsu: PartsComponent = (props) => {
  const [iconParams, { computeColors }] = useIconParams();

  return (
    <>
      <SsrPortal
        target="eye-upper-target"
        isSVG={true}
        // biome-ignore lint/style/noNonNullAssertion: Always mounted when this component is rendered
        mount={props.mount ?? document.getElementById("eye-upper-target")!}
      >
        <path
          id="eye-pupil-fill-0"
          d="M270.569 200.453C271.085 199.476 270.712 198.266 269.736 197.75L264.433 194.944C263.456 194.427 262.246 194.8 261.729 195.776L247.701 222.294L221.183 208.266C220.207 207.749 218.996 208.122 218.48 209.098L215.674 214.402C215.158 215.378 215.53 216.588 216.507 217.105L243.025 231.134L228.996 257.651C228.479 258.628 228.852 259.838 229.829 260.355L235.132 263.16C236.108 263.677 237.319 263.304 237.835 262.328L251.864 235.81L278.382 249.838C279.358 250.355 280.568 249.982 281.085 249.006L283.891 243.702C284.407 242.726 284.034 241.516 283.058 240.999L256.54 226.971L270.569 200.453Z"
          fill={
            iconParams.eyes.eyelashesColor ??
            computeColors.eyes.computedEyelashesColor
          }
        />
      </SsrPortal>
    </>
  );
};

export default Batsu;
